"use client";

import { logOut } from "@/components/auth/actions";
import { Button } from "@/components/ui/button";
import CreateWorkspace from "@/components/workspace/create-workspace";
import JoinWorkspace from "@/components/workspace/join-workspace";
import { Plus, Signpost } from "lucide-react";
import React from "react";

export default function NoWorkspacesPage() {
	const [createOpen, setCreateOpen] = React.useState(false);
	const [joinOpen, setJoinOpen] = React.useState(false);

	return (
		<>
			<main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
				<h1 className="text-3xl font-black">┐(￣∀￣)┌</h1>
				<h2 className="text-lg">
					You don&apos;t have access to any workspaces. Create or join one
					to get started.
				</h2>
				<div className="flex flex-row gap-4">
					<CreateWorkspace open={createOpen} setOpen={setCreateOpen} />
					<JoinWorkspace open={joinOpen} setOpen={setJoinOpen} />
					<Button variant="outline" onClick={() => setCreateOpen(true)}>
						<Plus />
						Create Workspace
					</Button>
					<Button onClick={() => setJoinOpen(true)}>
						<Signpost />
						Join Workspace
					</Button>
				</div>
				<Button onClick={async () => await logOut()} variant="link">
					Sign out
				</Button>
			</main>
		</>
	)
}