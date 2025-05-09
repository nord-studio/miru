"use client";

import { Button } from "@/components/ui/button"
import { kickWorkspaceMember } from "@/components/workspace/actions";
import { WorkspaceMemberWithUser } from "@/types/workspace";
import React from "react";
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts";
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
import Spinner from "@/components/ui/spinner";

export function KickWorkspaceMember({ member, open, setOpen }: { member: WorkspaceMemberWithUser, open: boolean, setOpen: (open: boolean) => void }) {
	const [loading, setLoading] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

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

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="gap-0 p-0 sm:max-w-[425px]">
						<DialogHeader className="p-6">
							<DialogTitle>Kick {member.user.name}?</DialogTitle>
							<DialogDescription>Are you sure you want to kick this member from the workspace? You will need to re-invite them if you want them to rejoin later.</DialogDescription>
						</DialogHeader>
						<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-200/50 dark:bg-neutral-900/50 p-4 rounded-b-lg">
							<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<div className="flex flex-row gap-4">
								<Button variant="destructive" disabled={loading} onClick={async () => {
									await kick();
								}}>
									{loading ? "Kicking" : "Kick"}
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
							<DrawerTitle>Kick {member.user.name}?</DrawerTitle>
							<DrawerDescription>Are you sure you want to kick this member from the workspace? You will need to re-invite them if you want them to rejoin later.</DrawerDescription>
						</DrawerHeader>
						<div className="flex w-full flex-row justify-between gap-2 border-t p-4">
							<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button variant="destructive" disabled={loading} onClick={async () => {
								await kick();
							}}>
								{loading ? "Kicking" : "Kick"}
								{loading && <Spinner />}
							</Button>
						</div>
					</DrawerContent>
				</Drawer>
			</>
		)
	}
}

export default function KickWorkspaceMemberButton({ member }: { member: WorkspaceMemberWithUser }) {
	const [open, setOpen] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <Button variant="destructive" size="sm">Kick</Button>;
	}

	return (
		<>
			<KickWorkspaceMember member={member} open={open} setOpen={setOpen} />
			<Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
				Kick
			</Button>
		</>
	)
}