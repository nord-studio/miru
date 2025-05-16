"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import {
	Drawer,
	DrawerClose,
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

import { Button } from "@/components/ui/button";
import { Mail, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import React from "react";
import { Icons } from "@/components/ui/icons";
import MonitorSelection from "@/components/monitors/monitor-select";
import { Monitor } from "@/types/monitor";
import { toast } from "sonner";
import { createChannel, testWebhook } from "@/components/notifications/actions";
import { Workspace } from "@/types/workspace";

export function CreateChannelButton({ monitors, workspace }: { monitors: Monitor[], workspace: Workspace }) {
	const [open, setOpen] = React.useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button>
				<PlusIcon />
				Create Channel
			</Button>
		);
	}

	return (
		<>
			<CreateChannel open={open} setOpen={setOpen} monitors={monitors} workspace={workspace} />
			<Button onClick={() => setOpen(!open)}>
				<PlusIcon />
				Create Channel
			</Button>
		</>
	)
}

export default function CreateChannel({ open, setOpen, monitors, workspace }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, monitors: Monitor[], workspace: Workspace }) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const [loading, setLoading] = useState(false);

	const [name, setName] = useState("");
	const [provider, setProvider] = useState<"email" | "slack" | "discord">("email");
	const [selectedMonitors, setSelectedMonitors] = useState<Monitor[]>([]);

	// Email provider
	const [email, setEmail] = useState("");

	// Discord provider
	const [url, setUrl] = useState("");

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const t = toast.loading("Please wait!", {
			description: "Creating channel..."
		});

		await createChannel({
			name,
			provider,
			workspaceSlug: workspace.slug,
			monitorIds: selectedMonitors.map((m) => m.id),
			email,
			url
		}).then((res) => {
			if (typeof res?.validationErrors !== "undefined") {
				return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
					id: t
				});
			}

			if (typeof res?.serverError !== "undefined") {
				return toast.error("Something went wrong!", { description: res.serverError, id: t });
			}

			if (res?.data?.error) {
				return toast.error("Something went wrong!", {
					description: res.data.message,
					id: t
				})
			}

			toast.success("Success!", {
				description: "Channel created successfully",
				id: t
			});
			setLoading(false);
			setOpen(false);
		})
	}

	async function testUrl() {
		if (provider === "email") {
			toast.error("Invalid provider", {
				description: "Please select a valid provider",
			});
			return;
		}

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
				description: res.message,
				id: t
			});
		}
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Create Channel</DialogTitle>
							<DialogDescription>
								Please fill in the details below to create a new
								notification channel.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										placeholder="Discord Server"
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Monitors</Label>
									<MonitorSelection monitors={monitors} value={selectedMonitors} setValue={setSelectedMonitors} min={1} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Provider</Label>
									<Select
										value={provider}
										onValueChange={(v) => setProvider(v as "email" | "slack" | "discord")}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="email" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="email">
												<Mail /> Email
											</SelectItem>
											<SelectItem value="discord">
												<Icons.Discord /> Discord
											</SelectItem>
											<SelectItem value="slack">
												<Icons.Slack /> Slack
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{provider === "email" && (
									<div className="flex flex-col gap-2 items-start w-full">
										<Label>Email</Label>
										<Input
											placeholder="tim@apple.com"
											disabled={loading}
											value={email}
											onChange={(e) =>
												setEmail(e.target.value)
											}
										/>
									</div>
								)}
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
							<div className="flex flex-row items-center justify-between gap-4 border-t rounded-b-lg bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
								<DialogClose asChild>
									<Button
										variant="outline"
										type="button"
										disabled={loading}
									>
										Cancel
									</Button>
								</DialogClose>
								<Button disabled={loading} type="submit" className="flex flex-row gap-2 items-center">
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
							<DrawerTitle>Create Channel</DrawerTitle>
							<DrawerDescription>
								Please fill in the details below to create a new
								notification channel.
							</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Provider</Label>
									<Select
										value={provider}
										onValueChange={(v) => setProvider(v as "email" | "slack" | "discord")}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="email" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="email">
												Email
											</SelectItem>
											<SelectItem value="discord">
												Discord
											</SelectItem>
											<SelectItem value="slack">
												Slack
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{provider === "email" && (
									<div className="flex flex-col gap-2 items-start w-full">
										<Label>Email</Label>
										<Input
											placeholder="tim@apple.com"
											disabled={loading}
											value={email}
											onChange={(e) =>
												setEmail(e.target.value)
											}
										/>
									</div>
								)}
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
								<span className="text-neutral-400 dark:text-neutral-600 text-sm">
									You can edit this later.
								</span>
								<div className="flex flex-row gap-2 items-center">
									<DrawerClose asChild>
										<Button
											variant="outline"
											type="button"
											disabled={loading}
										>
											Cancel
										</Button>
									</DrawerClose>
									<Button disabled={loading} type="submit">
										{loading ? "Creating" : "Create"}
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
