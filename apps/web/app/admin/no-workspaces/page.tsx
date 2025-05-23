import { CreateWorkspaceButton, JoinWorkspaceButton } from "@/app/admin/no-workspaces/buttons";
import { getCurrentUser, logOut } from "@/components/auth/actions";
import { Button } from "@/components/ui/button";
import { getConfig } from "@/lib/config";
import React from "react";

export default async function NoWorkspacesPage() {
	const user = await getCurrentUser();
	const { config } = await getConfig();

	return (
		<>
			<main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
				<h1 className="text-3xl font-black">(×﹏×)</h1>
				<h2 className="text-lg">
					You don&apos;t have access to any workspaces.
				</h2>
				<div className="flex flex-row gap-4">
					{user?.user.admin || config.workspace.creation === true && (
						<>
							<CreateWorkspaceButton />
						</>
					)}
					<JoinWorkspaceButton />
				</div>
				<form action={logOut}>
					<Button variant="link">
						Sign out
					</Button>
				</form>
			</main>
		</>
	)
}