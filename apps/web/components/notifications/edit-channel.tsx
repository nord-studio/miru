"use client";

import React, { useEffect, useState } from "react";
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

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import { Pen } from "lucide-react";
import { VariantProps } from "class-variance-authority";
import MonitorSelection from "@/components/monitors/monitor-select";
import { Monitor } from "@miru/types";
import { Notification, NotificationWithMonitors } from "@miru/types";
import { editNotification, testWebhook } from "@/components/notifications/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/ui/icons";

export function EditNotificationButton({
	notification,
	monitors,
	...props
}: {
	notification: NotificationWithMonitors;
	monitors: Monitor[];
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>) {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<>
				<Button {...props}>
					<Pen />
					<span className="hidden sm:inline">Edit Notification</span>
				</Button>
			</>
		);
	}

	return (
		<>
			<Button onClick={() => setOpen(!open)} {...props}>
				<Pen />
				<span className="hidden sm:inline">Edit Notification</span>
			</Button>
			<EditNotification
				open={open}
				setOpen={setOpen}
				notification={notification}
				monitors={monitors}
			/>
		</>
	);
}

export default function EditNotification({
	notification,
	monitors,
	open,
	setOpen,
}: {
	notification: NotificationWithMonitors;
	monitors: Monitor[];
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState(notification.name);
	const [provider, setProvider] = useState<Notification["provider"]>(notification.provider);
	const [url, setUrl] = useState(notification.url || "");
	const [monitorList, setMonitorList] = useState<Monitor[]>(notification.monitors.map((m) => m));

	async function testUrl() {
		const t = toast.loading("Testing webook...");

		if (!url) {
			toast.error("Invalid URL", {
				description: "Please provide a webhook URL",
				id: t
			})
		}

		const res = await testWebhook(url, provider);

		if (res?.error) {
			toast.error("Something went wrong!", {
				description: res.message,
				id: t
			});
		} else {
			toast.success("Success!", {
				description: "Webhook is valid",
				id: t
			});
		}
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const res = await editNotification({
			id: notification.id,
			name,
			monitors: monitorList.map((m) => m.id),
			provider,
			url,
		});

		if (typeof res?.validationErrors !== "undefined") {
			return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
				description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
			});
		}

		if (typeof res?.serverError !== "undefined") {
			return toast.error("Something went wrong!", { description: res.serverError })
		}

		if (res?.data?.error) {
			return toast.error("Something went wrong!", {
				description: res.data.message
			})
		}

		setLoading(false);
		setOpen(false);
		toast.success("Incident updated successfully");
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Editing {notification.name}</DialogTitle>
							<DialogDescription>
								Update the details below to update your notification.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input
										placeholder={notification.name}
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Connected Monitors</Label>
									<MonitorSelection
										monitors={monitors}
										value={monitorList}
										setValue={setMonitorList}
										disabled={loading}
										min={1}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Provider</Label>
									<Select
										value={provider}
										onValueChange={(v) => setProvider(v as "slack" | "discord")}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="discord" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="discord">
												<Icons.Discord /> Discord
											</SelectItem>
											<SelectItem value="slack">
												<Icons.Slack /> Slack
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{provider === "discord" && (
									<div className="flex flex-col gap-2 items-start w-full">
										<Label>Webhook URL</Label>
										<div className="flex flex-row gap-2 items-center w-full">
											<Input
												placeholder="https://discord.com/api/webhooks/..."
												disabled={loading}
												value={url}
												onChange={(e) =>
													setUrl(e.target.value)
												}
											/>
											<Button variant="outline" type="button" disabled={loading} onClick={async () => await testUrl()}>
												Test
											</Button>
										</div>
									</div>
								)}
								{provider === "slack" && (
									<div className="flex flex-col gap-2 items-start w-full">
										<Label>Webhook URL</Label>
										<div className="flex flex-row gap-2 items-center w-full">
											<Input
												placeholder="https://hooks.slack.com/services/..."
												disabled={loading}
												value={url}
												onChange={(e) =>
													setUrl(e.target.value)
												}
											/>
											<Button variant="outline" type="button" disabled={loading} onClick={async () => await testUrl()}>
												Test
											</Button>
										</div>
									</div>
								)}
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
									{loading && <Spinner />}
									{loading ? "Updating..." : "Update"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog >
			</>
		);
	} else {
		return (
			<>
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Edit Notification</DrawerTitle>
							<DrawerDescription>
								Update the details below to update your notification.
							</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input
										placeholder={notification.name}
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Connected Monitors</Label>
									<MonitorSelection
										monitors={monitors}
										value={monitorList}
										setValue={setMonitorList}
										min={1}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Provider</Label>
									<Select
										value={provider}
										onValueChange={(v) => setProvider(v as "slack" | "discord")}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="discord" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="discord">
												<Icons.Discord /> Discord
											</SelectItem>
											<SelectItem value="slack">
												<Icons.Slack /> Slack
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{provider === "discord" && (
									<div className="flex flex-col gap-2 items-start w-full">
										<Label>Webhook URL</Label>
										<div className="flex flex-row gap-2 items-center w-full">
											<Input
												placeholder="https://discord.com/api/webhooks/..."
												disabled={loading}
												value={url}
												onChange={(e) =>
													setUrl(e.target.value)
												}
											/>
											<Button variant="outline" type="button" disabled={loading} onClick={async () => await testUrl()}>
												Test
											</Button>
										</div>
									</div>
								)}
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
									{loading ? "Updating" : "Update"}
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
