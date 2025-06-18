"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import Spinner from "@/components/ui/spinner";
import { editWorkspace } from "@/components/workspace/actions";
import { Workspace } from "@miru/types"
import { ArrowRightIcon, Save } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

export default function OnboardingWorkspaceForm({ workspace }: { workspace: Workspace }) {
	const [loading, setLoading] = React.useState(false);
	const [name, setName] = React.useState(workspace.name);
	const [slug, setSlug] = React.useState(workspace.slug);

	async function handleSubmit() {
		setLoading(true);

		const res = await editWorkspace({
			id: workspace!.id,
			name,
			slug,
			members: []
		});

		if (res?.data?.error) {
			toast.error("Something went wrong!", {
				description: res.data.message
			});
		} else {
			toast.success("Success!", {
				description: "Workspace updated successfully."
			});
			setLoading(false);
		}
	}

	return (
		<>
			<div className="flex flex-col gap-6 items-center w-full">
				<div className="flex flex-col gap-4 w-full">
					<div className="flex flex-col gap-1">
						<h1 className="text-xl font-bold font-display">
							Name
						</h1>
						<p className="text-sm">Your workspace name is purely for organizational purposes.</p>
					</div>
					<Input placeholder={workspace.name} value={name} onChange={(e) => setName(e.target.value)} />
				</div>
				<div className="flex flex-col gap-4 w-full">
					<div className="flex flex-col gap-1">
						<h1 className="text-xl font-bold font-display">
							Slug
						</h1>
						<p className="text-sm">Your workspace slug is used in the Miru&apos;s URL.</p>
					</div>
					<Input placeholder={workspace.slug} value={slug} onChange={(e) => setSlug(e.target.value)} />
				</div>
			</div>
			<div className="flex flex-row gap-2 items-center justify-end w-full">
				{workspace.name !== name || workspace.slug !== slug ? (
					<Button onClick={async () => { await handleSubmit() }} disabled={loading}>
						{loading ? "Saving" : "Save"}
						{loading ? <Spinner /> : <Save />}
					</Button>
				) : (
					<Link href="/onboarding/monitor">
						<Button>
							Next <ArrowRightIcon />
						</Button>
					</Link>
				)}
			</div>
		</>
	)
}
