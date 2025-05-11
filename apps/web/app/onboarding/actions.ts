"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";

export async function getFirstWorkspace() {
	const data = await auth.api.getSession({
		headers: await headers()
	});

	if (!data || !data.user) {
		throw new Error("Unauthorized")
	}

	const workspace = await db.query.workspaces.findFirst({
		with: {
			members: {
				where: (members, { eq }) => eq(members.userId, data.user.id)
			},
		},
	});

	if (!workspace) {
		throw new Error("Workspace not found")
	}

	return workspace;
}