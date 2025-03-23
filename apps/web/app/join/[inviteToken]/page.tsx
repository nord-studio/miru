import JoinWorkspaceButtons from "@/app/join/[inviteToken]/buttons";
import { authClient } from "@/lib/auth/client";
import db from "@/lib/db";
import { workspaceInvites, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

export default async function JoinWorkspace({
	params
}: {
	params: Promise<{ inviteToken: string }>
}) {
	const { inviteToken } = await params;

	const session = await authClient.getSession();

	if (!session) {
		return redirect(`/auth/register?inviteToken=${inviteToken}`)
	}

	const invite = await db.select().from(workspaceInvites).where(eq(workspaceInvites.id, inviteToken)).limit(1);

	if (invite.length === 0) {
		return notFound();
	}

	const workspace = await db.select().from(workspaces).where(eq(workspaces.id, invite[0].workspaceId)).limit(1);

	if (workspace.length === 0) {
		return redirect(`/admin`)
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
							You've been invited to join the workspace "{workspace[0].name}" with the role of {invite[0].role}.
						</p>
					</div>
					<JoinWorkspaceButtons inviteToken={inviteToken} workspace={workspace[0]} />
				</div>
			</main>
		</>
	)
}