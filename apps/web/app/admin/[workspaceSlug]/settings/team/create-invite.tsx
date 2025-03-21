"use client";

import { createWorkspaceInvite } from "@/app/admin/[workspaceSlug]/settings/team/actions";
import { Button } from "@/components/ui/button";
import { CopyToClipboardInput } from "@/components/ui/copy-input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { generateId } from "@/lib/utils";
import { Workspace } from "@/types/workspace";
import React from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

function InviteTokenMesage({ open, setOpen, token, url }: { open: boolean, setOpen: (open: boolean) => void, token: string, url: string }) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Your Invite Token</DialogTitle>
							<DialogDescription>
								Please take note of your invite token / URL. You will not be able to see it again.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col px-6 pb-4 gap-4">
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Invite Token</Label>
								<CopyToClipboardInput content={token} />
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Invite URL</Label>
								<CopyToClipboardInput content={url} />
							</div>
						</div>
						<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
							<DialogClose asChild>
								<Button
									variant="outline"
									type="button"
								>
									Close
								</Button>
							</DialogClose>
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
							<DrawerTitle>Your Invite Token</DrawerTitle>
							<DrawerDescription>
								Please take note of your invite token / URL. You will not be able to see it again.
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex flex-col px-6 pb-4 gap-4">
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Members</Label>
							</div>
						</div>
						<div className="flex flex-row items-end w-full gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
							<DrawerClose asChild>
								<Button
									variant="outline"
									type="button"
								>
									Back
								</Button>
							</DrawerClose>
						</div>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}

export default function CreateInviteToken({ workspace, appUrl, children }: { workspace: Workspace, appUrl: string, children: React.ReactNode }) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = React.useState(false);

	const [finished, setFinished] = React.useState(false);

	const [inviteToken, setInviteToken] = React.useState(generateId());
	const [role, setRole] = React.useState<"member" | "admin" | "owner">("member");

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		const t = toast.loading("Creating token...");

		await createWorkspaceInvite({
			inviteToken,
			role,
			workspaceId: workspace.id,
		}).then((res) => {
			if (res?.validationErrors) {
				toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
					id: t
				});
			} else {
				toast.success("Success!", {
					description: res?.data?.message,
					id: t
				});

				// Open the message dialog
				setFinished(true);

				// Reset the state
				setOpen(false);
			}
		}).finally(() => {
			setLoading(false);
		});
	}

	if (isDesktop) {
		return (
			<>
				<InviteTokenMesage open={finished} setOpen={setFinished} token={inviteToken} url={`${appUrl}/admin/${workspace.slug}/join?inviteToken=${inviteToken}`} />
				<Dialog open={open} onOpenChange={() => {
					if (open === false) {
						setOpen(!open);
						setInviteToken(generateId());
						setRole("member");
					} else {
						setOpen(!open);
					}
				}}>
					<DialogTrigger asChild>
						{children}
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Create Invite Token</DialogTitle>
							<DialogDescription>
								Create an invite token to invite a user to this workspace.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Invite Token</Label>
									<CopyToClipboardInput content={inviteToken} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Invite URL</Label>
									<CopyToClipboardInput content={`${appUrl}/admin/${workspace.slug}/join?inviteToken=${inviteToken}`} />
								</div>
								<hr />
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Role</Label>
									<Select
										value={role}
										onValueChange={(value) => setRole(value as "member" | "admin" | "owner")}
									>
										<SelectTrigger>
											<SelectValue>{role}</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="owner">Owner</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
								<DialogClose asChild>
									<Button
										variant="outline"
										type="button"
										disabled={loading}
									>
										Cancel
									</Button>
								</DialogClose>
								<Button disabled={loading} type="submit">
									{loading ? <Spinner /> : "Create"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</>
		);
	} else {
		return (
			<>
				<InviteTokenMesage open={finished} setOpen={setFinished} token={inviteToken} url={`${appUrl}/admin/${workspace.slug}/join?inviteToken=${inviteToken}`} />
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerTrigger asChild>
						{children}
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Invite Members</DrawerTitle>
							<DrawerDescription>
								Select from the list of users to invite to this workspace.
								They will be sent an email with an invite link.
							</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Members</Label>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
								<span className="text-neutral-400 dark:text-neutral-600 text-sm">
									Note: You can update this later.
								</span>
								<div className="flex flex-row gap-2 items-center">
									<Button
										variant="outline"
										type="button"
										disabled={loading}
									>
										Back
									</Button>
									<Button disabled={loading} type="submit">
										{loading ? <Spinner /> : "Invite"}
									</Button>
								</div>
							</div>
						</form>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}