"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema/workspaces";
import { actionClient } from "@/lib/safe-action";
import { User } from "better-auth";
import { headers } from "next/headers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const getAllWorkspaces = actionClient.action(async () => {
	const wrkspcs = await db.select().from(workspaces);

	return wrkspcs;
});

export const getAllWorkspacesWithMembers = actionClient.action(async () => {
	const wrkspcs = await db.query.workspaceMembers.findMany({
		with: {
			workspace: true,
			user: true,
		},
	});

	revalidatePath("/admin/");

	return wrkspcs;
});

export const getAllUsers = actionClient.action(async () => {
	const users = await db.query.user.findMany();

	return users;
});

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
