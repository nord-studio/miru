"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button"
import { leaveWorkspace } from "@/components/workspace/actions";
import { Workspace } from "@miru/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts";
import React from "react";
import Spinner from "@/components/ui/spinner";

export function LeaveWorkspace({ workspace, open, setOpen }: { workspace: Workspace, open: boolean, setOpen: (open: boolean) => void }) {
	const router = useRouter();
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = React.useState(false);

	async function leave() {
		const t = toast.loading("Leaving workspace...");

		setLoading(true);

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
		}).finally(() => setLoading(false))
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="gap-0 p-0 sm:max-w-[425px]">
						<DialogHeader className="p-6">
							<DialogTitle>Leave {workspace.name}?</DialogTitle>
							<DialogDescription>You will not be able to rejoin this workspace unless you are invited back. This action cannot be undone.</DialogDescription>
						</DialogHeader>
						<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-200/50 dark:bg-neutral-900/50 p-4 rounded-b-lg">
							<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<div className="flex flex-row gap-4">
								<Button variant="destructive" disabled={loading} onClick={async () => {
									await leave();
								}}>
									{loading ? "Leaving" : "Leave"}
									{loading && <Spinner />}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</>
		);
	} else {
		return (
			<>
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Leave {workspace.name}?</DrawerTitle>
							<DrawerDescription>Are you sure you want to leave this workspace? You will need to be invited back to rejoin later.</DrawerDescription>
						</DrawerHeader>
						<div className="flex w-full flex-row justify-between gap-2 border-t p-4">
							<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button variant="destructive" disabled={loading} onClick={async () => {
								await leave();
							}}>
								{loading ? "Leaving" : "Leave"}
								{loading && <Spinner />}
							</Button>
						</div>
					</DrawerContent>
				</Drawer>
			</>
		)
	}
}

export default function LeaveWorkspaceButton({ workspace }: { workspace: Workspace }) {
	const [open, setOpen] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <Button variant="destructive" size="sm">Leave</Button>;
	}

	return (
		<>
			<LeaveWorkspace workspace={workspace} open={open} setOpen={setOpen} />
			<Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
				Leave
			</Button>
		</>
	)
}