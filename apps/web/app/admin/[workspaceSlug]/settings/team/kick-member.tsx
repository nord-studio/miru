"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { kickWorkspaceMember } from "@/components/workspace/actions";
import { WorkspaceMemberWithUser } from "@/types/workspace";
import React from "react";
import { toast } from "sonner"

export default function KickWorkspaceMember({ member }: { member: WorkspaceMemberWithUser }) {
	const [loading, setLoading] = React.useState(false);

	async function kick() {
		setLoading(true);
		const t = toast.loading("Kicking member...");

		await kickWorkspaceMember({
			workspaceId: member.workspaceId,
			memberId: member.id,
		}).then((res) => {
			if (res?.validationErrors) {
				toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
					id: t
				});
			}

			if (res?.data?.error) {
				toast.error("Something went wrong!", {
					description: res.data.message,
					id: t
				});
			}

			toast.success("Success!", {
				description: `Successfully kicked ${member.user.name}`,
				id: t
			});
		}).finally(() => setLoading(false))
	}

	return (
		<>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button size="sm" variant="destructive">
						Kick
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Kick {member.user.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to kick {member.user.name} from the workspace?
							You will need to re-invite them if you want them to rejoin later.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button disabled={loading} variant="destructive" onClick={async () => await kick()}>Kick {member.user.name}</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}