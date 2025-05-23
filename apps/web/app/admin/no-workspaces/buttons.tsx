"use client";

import { Button } from "@/components/ui/button";
import CreateWorkspace from "@/components/workspace/create-workspace";
import JoinWorkspace from "@/components/workspace/join-workspace";
import { Plus, Signpost } from "lucide-react";
import { useState } from "react";

export function JoinWorkspaceButton() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<Signpost />
				Join Workspace
			</Button>
			<JoinWorkspace open={open} setOpen={setOpen} />
		</>
	);
}

export function CreateWorkspaceButton() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				<Plus />
				Create Workspace
			</Button>
			<CreateWorkspace open={open} setOpen={setOpen} />
		</>
	);
}