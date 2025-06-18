"use client";

import * as React from "react";

import { useMediaQuery } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/lib/auth";
import { Workspace } from "@miru/types";
import { deleteWorkspace } from "@/components/workspace/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteWorkspaceConfirm({
	user,
	workspace,
	children,
}: {
	user: User;
	workspace: Workspace;
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);
	const [username, setUsername] = React.useState("");
	const [phrase, setPhrase] = React.useState("");
	const [enabled, setEnabled] = React.useState(false);
	const router = useRouter();

	const toggleOpen = React.useCallback(() => {
		setOpen(!open);
		setUsername("");
		setPhrase("");
		setEnabled(false);
	}, [open]);

	React.useEffect(() => {
		if (user) {
			if (phrase === workspace.name) {
				setEnabled(true);
			} else {
				setEnabled(false);
			}
		} else {
			toggleOpen();
		}
	}, [username, phrase, user, toggleOpen, workspace.name]);

	const handleDelete = async () => {
		const t = toast.loading("Deleting workspace...");

		await deleteWorkspace({ id: workspace.id }).then((res) => {
			if (res?.data?.error) {
				return toast.error("Something went wrong!", {
					id: t,
					description: res.data.message
				});
			} else {
				toast.success("Workspace deleted successfully!", {
					id: t,
				});
				toggleOpen();

				return router.push("/admin");
			}
		})
	}

	const isDesktop = useMediaQuery("(min-width: 768px)");

	if (isDesktop) {
		return (
			<>
				{user && (
					<Dialog open={open} onOpenChange={toggleOpen}>
						<DialogTrigger asChild>{children}</DialogTrigger>
						<DialogContent className="p-0 sm:max-w-[425px]">
							<DialogHeader className="px-6 pt-6">
								<DialogTitle>Delete Workspace?</DialogTitle>
								<DialogDescription asChild>
									<span>
										Miru will <b>permanently</b> delete this workspace and all of its contents.
									</span>
								</DialogDescription>
							</DialogHeader>
							<div className="flex flex-col items-start gap-4 px-6 pb-2">
								<div className="flex w-full flex-col gap-4">
									<Label htmlFor="name" className="text-sm text-neutral-500 dark:text-neutral-400 gap-1 ">
										To confirm deletion, type your workspace name &quot;{workspace.name}&quot; below:
									</Label>
									<Input
										value={phrase}
										onChange={(e) => setPhrase(e.target.value)}
										placeholder={workspace.name}
									/>
								</div>
							</div>
							<div className="flex w-full flex-row justify-between border-t bg-neutral-200 p-3 dark:bg-neutral-900 rounded-b-lg">
								<Button variant="outline" onClick={toggleOpen}>
									Cancel
								</Button>
								<Button
									variant="destructive"
									disabled={!enabled}
									onClick={() => handleDelete()}
								>
									Confirm Deletion
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</>
		);
	}

	return (
		<>
			{user && (
				<Drawer open={open} onOpenChange={setOpen} onClose={toggleOpen}>
					<DrawerTrigger asChild>{children}</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader className="p-6 text-left">
							<DrawerTitle>Delete Workspace?</DrawerTitle>
							<DrawerDescription>
								<span>
									Miru will <b>permanently</b> delete this workspace and all of its contents.
								</span>
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex flex-col items-start gap-4 px-6 pb-6">
							<div className="flex w-full flex-col gap-3">
								<Label htmlFor="name" className="text-sm text-neutral-500 dark:text-neutral-400 gap-1">
									To confirm deletion, type your workspace name <b>&quot;{workspace.name}&quot;</b> below:
								</Label>
								<Input
									value={phrase}
									onChange={(e) => setPhrase(e.target.value)}
									placeholder={workspace.name}
								/>
							</div>
						</div>
						<DrawerFooter className="flex w-full flex-row justify-between border-t bg-neutral-200 p-3 dark:bg-neutral-900">
							<Button variant="outline" onClick={toggleOpen}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								disabled={!enabled}
								onClick={() => handleDelete()}
							>
								Confirm Deletion
							</Button>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			)}
		</>
	);
}