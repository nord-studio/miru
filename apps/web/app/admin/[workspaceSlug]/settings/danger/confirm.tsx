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
import { User } from "better-auth/types";
import { TriangleAlertIcon } from "lucide-react";
import { Workspace } from "@/types/workspace";
import { deleteWorkspace } from "@/components/workspace/actions";
import { toast } from "sonner";

export function DeleteAccountConfirm({
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
										Miru will <b>permanently</b> delete all data associated
										with your workspace.
									</span>
								</DialogDescription>
							</DialogHeader>
							<div className="flex flex-col items-start gap-4 px-6 pb-2">
								<div className="flex w-full flex-col gap-4">
									<Label htmlFor="name" className="text-sm text-neutral-500 gap-1">
										To confirm deletion, type your workspace name <b>&quot;{workspace.name}&quot;</b> below:
									</Label>
									<Input
										value={phrase}
										onChange={(e) => setPhrase(e.target.value)}
										placeholder={workspace.name}
									/>
								</div>
							</div>
							<div className="flex w-full flex-row justify-between border-t bg-neutral-200 p-3 dark:bg-neutral-900">
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
							<DrawerTitle>Delete Account</DrawerTitle>
							<DrawerDescription>
								Katarogu will <b>permanently</b> delete all data associated with
								your account.
								<br /> <br />
								We reccomend you export your data before deleting your account.
								<div className="my-4 flex flex-row items-center gap-2 rounded-md border border-red-500 p-2 text-red-500 dark:border-red-700">
									<TriangleAlertIcon className="h-4 w-4 text-red-500 dark:text-red-700" />
									<span>
										This action is <b>not</b> reversible.
									</span>
								</div>
							</DrawerDescription>
							<div className="flex flex-col items-start gap-4">
								<div className="flex w-full flex-col gap-1">
									<Label className="text-sm text-neutral-500">
										To verify, type <b>delete my account</b> below:
									</Label>
									<Input
										value={phrase}
										onChange={(e) => setPhrase(e.target.value)}
									/>
								</div>
							</div>
						</DrawerHeader>
						<DrawerFooter className="flex w-full flex-row justify-between border-t bg-neutral-200 p-3 dark:bg-neutral-900">
							<Button variant="outline" onClick={toggleOpen}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => alert("Your workspace has been deleted!")}
								disabled={!enabled}
							>
								Delete Account
							</Button>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			)}
		</>
	);
}