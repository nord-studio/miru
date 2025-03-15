"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema/workspaces";
import { actionClient } from "@/lib/safe-action";
import { User } from "better-auth";
import { headers } from "next/headers";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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

	const wrkspcs = rawWrkspcs.filter((workspace) =>
		workspace.members.some(
			(member) => member.userId === currentUser?.user.id
		)
	);

	redirect(`/admin/${wrkspcs[0].slug}`);
})