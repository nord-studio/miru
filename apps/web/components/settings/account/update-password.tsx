import React from "react";
import { useMediaQuery } from "usehooks-ts";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { LockIcon } from "lucide-react";
import { updatePassword } from "@/components/auth/actions";
import { User } from "@/lib/auth";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordDialog({ children, user }: { children: React.ReactNode; user: User }) {
	const [loading, setLoading] = React.useState(false);
	const [password, setPassword] = React.useState("");
	const [confirm, setConfirm] = React.useState("");

	const router = useRouter();

	const isDesktop = useMediaQuery("(min-width: 768px)");

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (loading) return;
		setLoading(true);

		const t = toast.loading("Updating password...");

		const res = await updatePassword({
			id: user.id,
			password,
			passwordConfirm: confirm
		});

		if (typeof res?.validationErrors !== "undefined") {
			return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
				description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
				id: t
			});
		}

		if (typeof res?.serverError !== "undefined") {
			return toast.error("Something went wrong!", { description: res.serverError, id: t })
		}

		if (res?.data?.error) {
			return toast.error("Something went wrong!", {
				description: res.data.message,
				id: t
			})
		}

		toast.success("Success!", {
			description: "Your password has been updated. Please log in again.",
			id: t
		});

		await authClient.signOut();
		router.replace("/auth/login");
	}

	if (isDesktop) {
		return (
			<>
				<Dialog>
					<DialogTrigger asChild>{children}</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Update Password</DialogTitle>
							<DialogDescription>
								Make sure to use a strong password that you haven&apos;t used before. You&apos;ll be logged out of all devices after this change.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 py-2 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>New password</Label>
									<Input
										value={password}
										type="password"
										onChange={(e) =>
											setPassword(e.target.value)
										}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Confirm password</Label>
									<Input
										value={confirm}
										type="password"
										onChange={(e) =>
											setConfirm(e.target.value)
										}
										disabled={loading}
									/>
								</div>
							</div>
						</form>
						<div className="flex w-full flex-row justify-between border-t bg-neutral-200 p-3 dark:bg-neutral-900 rounded-b-lg">
							<DialogClose asChild>
								<Button variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button
								disabled={loading || password !== confirm}
								onClick={onSubmit}
							>
								{loading ? <Spinner /> : <LockIcon />}
								{loading ? "Updating..." : "Update"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</>
		)
	} else {
		return (
			<>
				<Drawer>
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
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>New password</Label>
									<Input
										value={password}
										type="password"
										onChange={(e) =>
											setPassword(e.target.value)
										}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Confirm password</Label>
									<Input
										value={confirm}
										type="password"
										onChange={(e) =>
											setConfirm(e.target.value)
										}
										disabled={loading}
									/>
								</div>
							</div>
						</form>
						<DrawerFooter className="flex w-full flex-row justify-between border-t bg-neutral-200 p-3 dark:bg-neutral-900">
							<DrawerClose asChild>
								<Button variant="outline">
									Cancel
								</Button>
							</DrawerClose>
							<Button
								variant="destructive"
								disabled={loading || password !== confirm}
								onClick={onSubmit}
							>
								{loading ? <Spinner /> : <LockIcon />}
								{loading ? "Updating..." : "Update"}
							</Button>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			</>
		)
	}
}