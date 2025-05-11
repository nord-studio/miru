"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getFirstWorkspace() {
	const data = await auth.api.getSession({
		headers: await headers()
	});

	if (!data || !data.user) {
		return redirect("/auth/login");
	}

	const workspace = await db.query.workspaces.findFirst({
		with: {
			members: {
				where: (members, { eq }) => eq(members.userId, data.user.id)
			},
		},
	});

	if (!workspace) {
		return redirect("/admin/no-workspaces");
	}

	return workspace;
}