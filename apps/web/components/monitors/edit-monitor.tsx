"use client";

import React from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editMonitor } from "@/components/monitors/actions";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import { Monitor } from "@/types/monitor";
import { Pen } from "lucide-react";
import { VariantProps } from "class-variance-authority";

export function EditMonitorButton({
	monitor,
	...props
}: {
	monitor: Monitor;
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>) {
	const [open, setOpen] = React.useState(false);
	const [moutned, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!moutned) {
		return (
			<>
				<Button {...props}>
					<Pen />
					<span className="hidden sm:inline">Edit Monitor</span>
				</Button>
			</>
		);
	}

	return (
		<>
			<Button onClick={() => setOpen(!open)} {...props}>
				<Pen />
				<span className="hidden sm:inline">Edit Monitor</span>
			</Button>
			<EditMonitor open={open} setOpen={setOpen} monitor={monitor} />
		</>
	);
}

export default function EditMonitor({
	monitor,
	open,
	setOpen,
}: {
	monitor: Monitor;
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = React.useState(false);
	const [name, setName] = React.useState(monitor.name);
	const [url, setUrl] = React.useState(monitor.url);
	const [type, setType] = React.useState<"http" | "tcp">(monitor.type);
	const [interval, setInterval] = React.useState(monitor.interval.toString());

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		editMonitor({
			id: monitor.id,
			data: {
				name,
				type,
				url,
				interval: parseInt(interval),
			}
		}).then((res) => {
			if (res?.data?.error) {
				toast.error("Something went wrong!", {
					description: res.data.message
				})
			} else {
				toast.success("Monitor updated successfully!");
				setOpen(false);
			}
		}).finally(() => setLoading(false));
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Edit Monitor</DialogTitle>
							<DialogDescription>
								Update the details below to update your monitor.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input
										placeholder={monitor.name}
										value={name}
										onChange={(e) => setName(e.target.value)}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Type</Label>
									<Select
										value={type}
										onValueChange={(value) =>
											setType(value as "http" | "tcp")
										}
										name="type"
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={monitor.type}
											/>
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
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										placeholder={monitor.url}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Interval</Label>
									<Select
										value={interval}
										onValueChange={(value) =>
											setInterval(value)
										}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={monitor.interval.toString()}
											/>
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
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 rounded-b-lg p-4">
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
									{loading ? "Updating" : "Update"}
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
							<DrawerTitle>Edit Monitor</DrawerTitle>
							<DrawerDescription>
								Update the details below to update your monitor.
							</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder={monitor.name}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Type</Label>
									<Select
										value={type}
										onValueChange={(value) =>
											setType(value as "http" | "tcp")
										}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={monitor.type}
											/>
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
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										placeholder={monitor.url}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Interval</Label>
									<Select
										value={interval}
										onValueChange={(value) =>
											setInterval(value)
										}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={monitor.interval.toString()}
											/>
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
									Note: This will not ping your monitor.
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
										{loading ? "Updating" : "Update"}
										{loading && <Spinner />}
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
