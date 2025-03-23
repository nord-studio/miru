import JoinWorkspaceButtons from "@/app/join/[inviteToken]/buttons";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { workspaceInvites, workspaceMembers, workspaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

function InvalidOrExpired() {
	return (
		<>
			<main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
				<h1 className="text-3xl font-black">┐(￣∀￣)┌</h1>
				<h2 className="text-lg">
					This invite doesn&apos;t exist or has expired.
				</h2>
				<Link href="/admin">
					<Button variant="outline">
						Go to /admin
					</Button>
				</Link>
			</main>
		</>
	)
}

export default async function JoinWorkspace({
	params
}: {
	params: Promise<{ inviteToken: string }>
}) {
	const { inviteToken } = await params;

	const currentUser = await auth.api.getSession({
		headers: await headers()
	});

	if (!currentUser?.user) {
		return redirect(`/auth/register?inviteToken=${inviteToken}`)
	}

	const invite = await db.select().from(workspaceInvites).where(eq(workspaceInvites.id, inviteToken)).limit(1);

	if (invite.length === 0) {
		return (<InvalidOrExpired />)
	}

	if (invite[0].validUntil < new Date()) {
		return (<InvalidOrExpired />)
	}

	const workspace = await db.select().from(workspaces).where(eq(workspaces.id, invite[0].workspaceId)).limit(1);

	if (workspace.length <= 0) {
		return redirect(`/admin`)
	}

	const workspaceMember = await db.query.workspaceMembers.findMany({
		with: {
			workspace: true,
			user: true
		},
		where: () => and(eq(workspaceMembers.workspaceId, invite[0].workspaceId), eq(workspaceMembers.userId, currentUser.user.id))
	});

	if (workspaceMember.length >= 1) {
		return redirect(`/admin/${workspaceMember[0].workspace.slug}/monitors`)
	}

	return (
		<>
			<main className="min-h-screen w-full flex flex-col justify-center items-center">
				<div className="flex flex-col gap-6 w-full items-center">
					<div className="flex flex-col items-center">
						<h1 className="text-3xl font-bold">
							Join {workspace[0].name}?
						</h1>
						<p>
							You&apos;ve been invited to join the workspace &quot;{workspace[0].name}&quot; with the role of {invite[0].role}.
						</p>
					</div>
					<JoinWorkspaceButtons inviteToken={inviteToken} />
				</div>
			</main>
		</>
	)
}