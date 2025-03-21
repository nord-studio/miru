"use server";

import { actionClient } from "@/lib/safe-action";
import { render } from "jsx-email";
import { createTransport } from "nodemailer";
import WorkspaceInviteEmail from "@/lib/email/workspace-invite";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { z } from "zod";
import React from "react";
import { Workspace } from "@/types/workspace";
import { workspaceInvites, workspaceMembers } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import db from "@/lib/db";
import { flattenValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export const inviteMemberViaEmail = actionClient.schema(z.object({
	workspace: z.custom<Workspace>(),
	email: z.string().email(),
	role: z.enum(["admin", "member", "owner"]),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
}).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { workspace, email, role } }) => {
	if (process.env.ENABLE_EMAIL !== "true") {
		return {
			error: true,
			message: "Emails haven't been enabled on this instance. Please try generating an invite code instead.",
		}
	}

	// Send email to users
	const transporter = createTransport({
		host: process.env.SMTP_HOST,
		secure: process.env.SMTP_SECURE === 'true',
		port: Number(process.env.SMTP_PORT),
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
		debug: process.env.NODE_ENV === "development",
	} as SMTPTransport.Options);

	// Send email
	const inviteToken = generateId();
	const body = await render(<WorkspaceInviteEmail workspaceName={workspace.name} workspaceSlug={workspace.slug} inviteToken={inviteToken} />);

	await db.insert(workspaceInvites).values({
		id: inviteToken,
		workspaceId: workspace.id,
		role: role,
		// Two Weeks
		validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
	});

	await transporter.sendMail({
		from: process.env.SMTP_FROM,
		to: email,
		subject: `You've been invited to join ${workspace.name} on Miru`,
		html: body
	});

	return {
		error: false,
		message: "Invites sent successfully",
	};
})

export const createWorkspaceInvite = actionClient.schema(z.object({
	inviteToken: z.string().nonempty(),
	workspaceId: z.string().nonempty(),
	role: z.enum(["admin", "member", "owner"]),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { inviteToken, workspaceId, role } }) => {
	await db.insert(workspaceInvites).values({
		id: inviteToken,
		workspaceId: workspaceId,
		role: role,
		// Two Weeks
		validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
	});

	return {
		error: false,
		message: "Invite created successfully.",
	};
})

export const leaveWorkspace = actionClient.schema(z.object({
	workspaceId: z.string().nonempty(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { workspaceId } }) => {
	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	if (!currentUser) {
		return { error: true, message: "You are not logged in" };
	}

	const res = await db.delete(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, currentUser.user.id))).returning();

	if (!res) {
		return { error: true, message: "Failed to leave workspace" };
	}

	return { error: false, message: "You've left the workspace successfully" };
})