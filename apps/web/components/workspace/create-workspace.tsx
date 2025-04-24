"use client";

import React, { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import UsersSelection from "@/components/workspace/users-select";
import { User } from "@/lib/auth";
import { createWorkspace } from "@/components/workspace/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/components/auth/actions";
import { kebabCase } from "es-toolkit/string";

export default function CreateWorkspace({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [members, setMembers] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	React.useEffect(() => {
		getCurrentUser().then((res) => {
			if (res) {
				setCurrentUser(res.user);
			} else {
				throw new Error("Failed to fetch current user");
			}
		});
	}, []);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const t = toast.loading("Creating Workspace...");

		await createWorkspace({
			name,
			slug,
			members: [...members, ...(currentUser ? [currentUser] : [])],
		}).then((res) => {
			if (res?.validationErrors) {
				toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
					id: t
				});
			}

			if (res?.data?.error) {
				return toast.error("Something went wrong!", {
					description: res.data.message,
					id: t
				});
			}

			toast.success("Success!", {
				description: res?.data?.message,
				id: t
			});

			router.push(`/admin/${kebabCase(slug ? slug : name).replace("/", "-").replace("\\", "-")}/monitors`)
		}).finally(() => setLoading(false));
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Create Workspace</DialogTitle>
							<DialogDescription>
								Create a new workspace to seperate your monitors
								into different groups. You will automatically be
								added as the owner of the workspace.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input
										disabled={loading}
										required={true}
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Slug (Optional)</Label>
									<Input
										disabled={loading}
										value={slug}
										onChange={(e) =>
											setSlug(e.target.value)
										}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Invite Members (Optional)</Label>
									<UsersSelection
										value={members}
										setValue={setMembers}
										exclude={currentUser ? [currentUser] : []}
									/>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4 rounded-b-lg">
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
									{loading ? "Creating" : "Create"}
									{loading && <Spinner />}
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
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Create Workspace</DrawerTitle>
							<DrawerDescription>
								Create a new workspace to seperate your monitors
								into different groups.
							</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-4 pb-6 gap-4">
								<div className="flex flex-col gap-3 items-start w-full">
									<Label>Name</Label>
									<Input
										disabled={loading}
										required={true}
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
									/>
								</div>
								<div className="flex flex-col gap-3 items-start w-full">
									<Label>Slug (Optional)</Label>
									<Input
										disabled={loading}
										value={slug}
										onChange={(e) =>
											setSlug(e.target.value)
										}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Invite Members (Optional)</Label>
									<UsersSelection
										value={members}
										setValue={setMembers}
										exclude={currentUser ? [currentUser] : []}
									/>
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
									{loading ? "Creating" : "Create"}
									{loading && <Spinner />}
								</Button>
							</div>
						</form>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}
