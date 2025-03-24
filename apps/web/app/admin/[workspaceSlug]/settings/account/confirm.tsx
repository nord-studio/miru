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
import { TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function DeleteAccountConfirm({
	user,
}: {
	user: User;
}) {
	const [open, setOpen] = React.useState(false);
	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [enabled, setEnabled] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);
	const router = useRouter();

	const toggleOpen = React.useCallback(() => {
		setOpen(!open);
		setUsername("");
		setPassword("");
		setEnabled(false);
	}, [open]);

	React.useEffect(() => {
		setMounted(true);
		if (user) {
			if (password.length > 0) {
				setEnabled(true);
			} else {
				setEnabled(false);
			}
		} else {
			toggleOpen();
		}
	}, [username, password, user, toggleOpen]);

	const handleDelete = async () => {
		const t = toast.loading("Deleting account...");

		await authClient.deleteUser({ password }).then((res) => {
			if (res.error) {
				return toast.error("Something went wrong!", {
					id: t,
					description: res.error.message
				});
			} else {
				toast.success("Success!", {
					description: "Your account has been deleted.",
					id: t,
				});
				toggleOpen();
				return router.push("/auth/login");
			}
		})
	}

	const isDesktop = useMediaQuery("(min-width: 768px)");

	if (!mounted) {
		return (
			<>
				<Button variant="destructive">
					Delete Account
				</Button>
			</>
		)
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={toggleOpen}>
					<DialogTrigger asChild>
						<Button variant="destructive">
							Delete Account
						</Button>
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Delete Account?</DialogTitle>
							<DialogDescription asChild>
								<span>
									Miru will <b>permanently</b> delete all data associated with
									your account. This includes all workspaces you own, as well as their monitors, incidents, status pages and more.
									<div className="my-4 flex flex-row items-center gap-2 rounded-md border border-red-500 p-2 text-red-500 dark:border-red-700">
										<TriangleAlertIcon className="h-4 w-4 text-red-500 dark:text-red-700" />
										<span>
											This action is <b>not</b> reversible.
										</span>
									</div>
								</span>
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col items-start gap-4 px-6 pb-2">
							<div className="flex w-full flex-col gap-2">
								<Label htmlFor="name" className="text-sm text-neutral-500 gap-1">
									To confirm deletion, enter your password below:
								</Label>
								<Input
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Password"
									type="password"
									name="current-password"
									id="current-password"
									autoComplete="current-password"
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
			</>
		);
	}

	return (
		<>
			<Drawer open={open} onOpenChange={setOpen} onClose={toggleOpen}>
				<DrawerTrigger asChild>
					<Button variant="destructive">
						Delete Account
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader className="p-6 text-left">
						<DrawerTitle>Delete Account</DrawerTitle>
						<DrawerDescription asChild>
							<span>
								Miru will <b>permanently</b> delete all data associated with
								your account. This includes all workspaces you own, as well as their monitors, incidents, status pages and more.
								<div className="my-4 flex flex-row items-center gap-2 rounded-md border border-red-500 p-2 text-red-500 dark:border-red-700">
									<TriangleAlertIcon className="h-4 w-4 text-red-500 dark:text-red-700" />
									<span>
										This action is <b>not</b> reversible.
									</span>
								</div>
							</span>
						</DrawerDescription>
						<div className="flex flex-col items-start gap-4">
							<div className="flex w-full flex-col gap-1">
								<Label className="text-sm text-neutral-500">
									To verify, please enter your password below:
								</Label>
								<Input
									value={password}
									onChange={(e) => setPassword(e.target.value)}
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
		</>
	);
}