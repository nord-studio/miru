"use client";

import { Workspace } from "@miru/types";
import SettingsCard from "@/components/settings/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { editWorkspace } from "@/components/workspace/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { kebabCase } from "es-toolkit/string";

export default function WorkspaceGeneralSettingsFields({ workspace }: { workspace: Workspace; }) {
	const [name, setName] = React.useState(workspace.name);
	const [slug, setSlug] = React.useState(workspace.slug);
	const router = useRouter();

	async function handleSubmit() {
		const res = await editWorkspace({
			id: workspace.id,
			name,
			slug,
			members: []
		})

		if (res?.data?.error) {
			toast.error("Something went wrong!", {
				description: res.data.message
			});
		} else {
			toast.success("Success!", {
				description: "Workspace updated successfully."
			});
			return router.push(`/admin/${kebabCase(slug ? slug : name).replace("/", "-").replace("\\", "-")}/settings`)
		}
	}

	return (
		<>
			<SettingsCard
				title="Name"
				description="Your workspace name is purely for organizational purposes."
				action={(
					<Button type="submit" size="sm" onClick={async () => await handleSubmit()} disabled={workspace.name === name}>
						Save
					</Button>
				)}
			>
				<Input placeholder={workspace.name} value={name} onChange={(e) => setName(e.target.value)} />
			</SettingsCard>
			<SettingsCard
				title="Slug"
				description="Your workspace slug is used in the Miru's URL."
				action={(
					<Button type="submit" size="sm" onClick={async () => {
						await handleSubmit()
					}} disabled={workspace.slug === slug}>
						Save
					</Button>
				)}
			>
				<Input placeholder={workspace.slug} value={slug} onChange={(e) => setSlug(e.target.value)} />
			</SettingsCard>
		</>
	)
}