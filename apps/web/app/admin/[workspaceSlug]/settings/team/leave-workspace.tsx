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
import { leaveWorkspace } from "@/components/workspace/actions";
import { Workspace } from "@/types/workspace";
import { useRouter } from "next/navigation";
import { toast } from "sonner"

export default function LeaveWorkspace({ workspace }: { workspace: Workspace }) {
	const router = useRouter();

	async function leave() {
		const t = toast.loading("Leaving workspace...");

		await leaveWorkspace({
			workspaceId: workspace.id,
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

			toast.success("Successfully left workspace!", {
				id: t
			});

			return router.push("/admin");
		})
	}

	return (
		<>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button size="sm" variant="destructive">
						Leave
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							You will not be able to rejoin this workspace unless you are invited back.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button variant="destructive" onClick={async () => await leave()}>Leave Workspace</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}