"use server";

import { actionClient } from "@/lib/safe-action";
import { User } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { render } from "jsx-email";
import { createTransport } from "nodemailer";
import WorkspaceInviteEmail from "@/lib/email/workspace-invite";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { z } from "zod";
import React, { cache } from "react";
import { Workspace } from "@/types/workspace";
import { workspaceInvites, workspaceMembers, workspaces } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import db from "@/lib/db";
import { flattenValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export const getAllWorkspaces = cache(actionClient.action(async () => {
	const wrkspcs = await db.select().from(workspaces);

	return wrkspcs;
}));

export const getAllWorkspacesWithMembers = cache(actionClient.action(async () => {
	const wrkspcs = await db.query.workspaceMembers.findMany({
		with: {
			workspace: true,
			user: true,
		},
	});

	return wrkspcs;
}));

export const getAllUsers = cache(actionClient.action(async () => {
	const users = await db.query.user.findMany();

	return users;
}));

export const createWorkspace = actionClient
	.schema(
		z.object({
			name: z.string().nonempty(),
			slug: z.string().nonempty(),
			members: z.array(z.custom<User>()),
		})
	)
	.action(async ({ parsedInput: { name, members, slug } }) => {
		const currentUser = await auth.api.getSession({
			headers: await headers(),
		});

		if (!currentUser) {
			return { error: true, message: "You are not logged in" };
		}

		const wrkspace = await db
			.insert(workspaces)
			.values({
				name,
				slug: slug
					? slug.toLowerCase().replace(/\s/g, "-")
					: name.toLowerCase().replace(/\s/g, "-"),
			})
			.returning();

		if (wrkspace.length === 0) {
			return { error: true, message: "Failed to create workspace" };
		}

		for (const member of members) {
			await db.insert(workspaceMembers).values({
				userId: member.id,
				workspaceId: wrkspace[0].id,
				role: currentUser.user.id === member.id ? "owner" : "member",
			});
		}

		return {
			error: false,
			message: `The workspace ${wrkspace[0].name} was created successfully.`,
		};
	});

export const editWorkspace = actionClient.schema(z.object({
	id: z.string().nonempty(),
	name: z.string(),
	slug: z.string(),
	members: z.array(z.custom<User>())
})).action(async ({ parsedInput: { id, name, slug } }) => {
	const chunks = [];

	if (name) {
		if (name.length <= 2) {
			return { error: true, message: "Workspace name must be at least 3 characters" };
		}
		chunks.push({ name: name });
	}

	if (slug) {
		if (slug.length <= 2) {
			return { error: true, message: "Workspace slug must be at least 3 characters" };
		}

		// check for spaces
		if (slug.includes(" ")) {
			return { error: true, message: "Workspace slug cannot have spaces" };
		}
		chunks.push({ slug: slug });
	}

	if (chunks.length === 0) {
		return { error: true, message: "No changes were made" };
	}

	const newData = chunks.reduce((acc, chunk) => {
		return { ...acc, ...chunk };
	}, {});

	await db.update(workspaces).set(newData).where(eq(workspaces.id, id)).then(async () => {
		revalidatePath("/admin/");
	}).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to update workspace" };
	})
});

export const deleteWorkspace = actionClient.schema(z.object({
	id: z.string().nonempty()
})).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id } }) => {
	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	if (!currentUser) {
		return { error: true, message: "You are not logged in" };
	}

	const rawWrkspcs = await db.query.workspaces.findMany({
		with: {
			members: true,
		},
	});

	if (rawWrkspcs.length === 1) {
		return { error: true, message: "You cannot delete the last workspace" };
	}

	const res = await db.delete(workspaces).where(eq(workspaces.id, id)).returning();

	if (!res) {
		return { error: true, message: "Failed to delete workspace" };
	}

	return { error: false, message: "Workspace deleted successfully" };
})

export const joinWorkspace = actionClient.schema(z.object({
	inviteToken: z.string().nonempty(),
	autoRedirect: z.boolean().default(true).optional(),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
}).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { inviteToken, autoRedirect } }) => {
	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	if (!currentUser) {
		return { error: true, message: "You are not logged in" };
	}

	const invite = await db.select().from(workspaceInvites).where(eq(workspaceInvites.id, inviteToken)).limit(1).then((res) => res[0]);

	if (!invite) {
		return { error: true, message: "Invite not found" };
	}

	const workspace = await db.select().from(workspaces).where(eq(workspaces.id, invite.workspaceId)).limit(1).then((res) => res[0]);

	if (!workspace) {
		return { error: true, message: "Workspace not found" };
	}

	await db.delete(workspaceInvites).where(eq(workspaceInvites.id, inviteToken));

	await db.insert(workspaceMembers).values({
		workspaceId: workspace.id,
		userId: currentUser.user.id,
		role: invite.role,
	});

	revalidatePath(`/admin/[workspaceSlug]`, "layout");

	if (autoRedirect === true) {
		return redirect(`/admin/${workspace.slug}`);
	} else {
		return { error: false, message: "You've joined the workspace successfully" };
	}
});

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
	const body = await render(<WorkspaceInviteEmail workspaceName={workspace.name} inviteToken={inviteToken} />);

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

/// Get the authenticated users workspace member data
export const getCurrentMember = cache(async (workspaceId: string) => {
	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	if (!currentUser) {
		return null;
	}

	const currentMember = await db.query.workspaceMembers.findMany({
		with: {
			user: true,
		},
		where: () => and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, currentUser.user.id)),
	});

	if (currentMember.length === 0) {
		return null;
	}

	return currentMember[0];

});

export const declineInvite = actionClient.schema(z.object({
	inviteToken: z.string().nonempty()
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { inviteToken } }) => {
	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	if (!currentUser) {
		return { error: true, message: "You are not logged in" };
	}

	await db.delete(workspaceInvites).where(eq(workspaceInvites.id, inviteToken));

	return { error: false, message: "Invite declined successfully" };
})