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
import { User } from "better-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import Spinner from "@/components/ui/spinner";

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
	const [loading, setLoading] = React.useState(false);
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
		setLoading(true);
		const t = toast.loading("Deleting account...");

		await authClient.deleteUser({ password }).then((res) => {
			if (res.error) {
				setLoading(false);
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
		});
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
								</span>
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col items-start gap-4 px-6 pb-2">
							<div className="flex w-full flex-col gap-2">
								<Label htmlFor="name" className="text-sm text-neutral-500 dark:text-neutral-400 gap-1">
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
						<div className="flex w-full flex-row justify-between border-t bg-neutral-200 p-3 dark:bg-neutral-900 rounded-b-lg">
							<Button variant="outline" onClick={toggleOpen} disabled={loading}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								disabled={!enabled || loading}
								onClick={() => handleDelete()}
							>
								{loading && <Spinner />}
								Confirm Deletion
							</Button>
						</div>
					</DialogContent>
				</Dialog >
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
						<DrawerDescription>
							Miru will <b>permanently</b> delete all data associated with
							your account. This includes all workspaces you own, as well as their monitors, incidents, status pages and more.
						</DrawerDescription>
						<div className="flex flex-col items-start gap-4 mt-4">
							<div className="flex w-full flex-col gap-2">
								<Label className="text-sm text-neutral-500 dark:text-neutral-400">
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
						<Button variant="outline" onClick={toggleOpen} disabled={loading}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => handleDelete()}
							disabled={!enabled || loading}
						>
							{loading && <Spinner />}
							Delete Account
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
}