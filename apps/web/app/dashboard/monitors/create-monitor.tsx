"use client";

import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMonitor } from "@/app/dashboard/monitors/actions";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";

export default function CreateMonitor() {
	const [open, setOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const data = new FormData(e.currentTarget);
		createMonitor({ error: false, message: "" }, data).then((res) => {
			setLoading(false);
			if (res.error) {
				toast.error(res.message);
			} else {
				toast.success("Monitor created successfully.");
				setOpen(!open);
			}
		});
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusIcon />
							Create Monitor
						</Button>
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Create Monitor</DialogTitle>
							<DialogDescription>
								Please fill in the details below to create a new
								monitor.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input
										placeholder="Website"
										name="name"
										id="name"
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Type</Label>
									<Select
										defaultValue="http"
										name="type"
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="HTTP" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="http">
												HTTP
											</SelectItem>
											<SelectItem value="tcp">
												TCP
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>URL</Label>
									<Input
										placeholder="https://tygr.dev"
										disabled={loading}
										name="url"
										id="url"
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Interval</Label>
									<Select
										defaultValue="5"
										name="interval"
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="1 Minute" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">
												1 Minute
											</SelectItem>
											<SelectItem value="5">
												5 Minutes
											</SelectItem>
											<SelectItem value="10">
												10 Minutes
											</SelectItem>
											<SelectItem value="30">
												30 Minutes
											</SelectItem>
											<SelectItem value="60">
												1 Hour
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
								<span className="text-neutral-400 dark:text-neutral-600 text-sm">
									You can edit this later.
								</span>
								<div className="flex flex-row gap-2 items-center">
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
					<DrawerTrigger asChild>
						<Button>
							<PlusIcon />
							Create Monitor
						</Button>
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Create Monitor</DrawerTitle>
							<DrawerDescription>
								Please fill in the details below to create a new
								monitor.
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex flex-col px-6 pb-4 gap-4">
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Name</Label>
								<Input
									placeholder="Website"
									name="name"
									id="name"
									disabled={loading}
								/>
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Type</Label>
								<Select
									defaultValue="http"
									name="type"
									disabled={loading}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="HTTP" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="http">
											HTTP
										</SelectItem>
										<SelectItem value="tcp">TCP</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>URL</Label>
								<Input
									placeholder="https://tygr.dev"
									disabled={loading}
									name="url"
									id="url"
								/>
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Interval</Label>
								<Select
									defaultValue="5"
									name="interval"
									disabled={loading}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="1 Minute" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">
											1 Minute
										</SelectItem>
										<SelectItem value="5">
											5 Minutes
										</SelectItem>
										<SelectItem value="10">
											10 Minutes
										</SelectItem>
										<SelectItem value="30">
											30 Minutes
										</SelectItem>
										<SelectItem value="60">
											1 Hour
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
							<span className="text-neutral-400 dark:text-neutral-600 text-sm">
								You can edit this later.
							</span>
							<div className="flex flex-row gap-2 items-center">
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
						</div>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}
