import { getCurrentMember } from "@/components/workspace/actions";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

export default async function WorkspaceTeamSettingsPage({ params, children }: { params: Promise<{ workspaceSlug: string }>, children: React.ReactNode }) {
	const { workspaceSlug } = await params;

	const workspace = await db.select().from(workspaces).where(eq(workspaces.slug, workspaceSlug)).then((data) => data[0]);
	const currentMember = await getCurrentMember(workspace.id);

	if (!currentMember) {
		return redirect("/auth/login")
	}

	enum rankedRoles {
		owner = 3,
		admin = 2,
		member = 1,
	};

	const roleRank = rankedRoles[currentMember.role];
	const canAccess = roleRank >= rankedRoles.admin;

	if (!canAccess) {
		return notFound();
	}

	return (
		<>
			{children}
		</>
	)
}