import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminRootPage() {
	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	if (!currentUser) {
		return redirect("/auth/login");
	}

	const rawWrkspcs = await db.query.workspaces.findMany({
		with: {
			members: true,
		},
	});

	const workspaces = rawWrkspcs.filter((workspace) =>
		workspace.members.some(
			(member) => member.userId === currentUser?.user.id
		)
	);

	if (workspaces.length === 0) {
		return redirect("/admin/no-workspaces");
	}

	redirect(`/admin/${workspaces[0].slug}/monitors`);
}
