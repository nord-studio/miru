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
import { createMonitor } from "@/components/monitors/actions";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import React from "react";
import Alert from "@/components/ui/alert";
import { testUrl } from "@/components/monitors/utils";
import { usePathname } from "next/navigation";

export default function CreateMonitor() {
	const pathname = usePathname();

	const [open, setOpen] = useState(false);
	const [brokenWarning, setBrokenWarning] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);
	const [mounted, setMounted] = useState(false);

	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	const [type, setType] = useState<"http" | "tcp">("http");
	const [interval, setInterval] = useState("5");

	useEffect(() => {
		setMounted(true);
	}, []);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		// test ping the domain
		const t = toast.loading(`Test pinging ${url}...`);

		if (!url || url.length < 1) {
			toast.error("Please enter a domain.", { id: t });
			setLoading(false);
			return;
		}

		// if the ping fails, show a warning
		testUrl(type, url)
			.then(() => {
				toast.success(`Connection established to ${url}.`, { id: t });
				handleMonitorCreate();
			})
			.catch(() => {
				toast.dismiss(t);
				setBrokenWarning(true);
				return;
			});
	}

	function handleMonitorCreate() {
		createMonitor({
			name,
			type,
			url,
			interval: parseInt(interval),
			workspaceSlug: pathname.split("/")[2],
		}).then((res) => {
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

			toast.success("Monitor created successfully.");
			setOpen(!open);
		}).finally(() => setLoading(false))
	}

	function handleMonitorTest() {
		if (!url || url.length < 1) {
			toast.error("Please enter a domain.");
			return;
		}

		if (!type || type.length < 1) {
			toast.error("Please select a monitor type.");
			return;
		}

		toast.promise(testUrl(type, url), {
			loading: `Test Pinging ${url}...`,
			success: `Connection established to ${url}!`,
			error: `Failed to ping ${url}. Is the domain correct?`,
		});
	}

	if (!mounted)
		return (
			<>
				<Button>
					<PlusIcon />
					<span className="hidden sm:block">Create Monitor</span>
				</Button>
			</>
		);

	if (isDesktop) {
		return (
			<>
				<Alert
					title="Are you sure?"
					description={`The test ping to ${url} failed. Do you want to save anyway?`}
					open={brokenWarning}
					setOpen={setBrokenWarning}
					onCancel={() => {
						setBrokenWarning(false);
						setLoading(false);
					}}
					onSubmit={() => {
						handleMonitorCreate();
						setLoading(false);
						setBrokenWarning(false);
					}}
				/>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusIcon />
							<span className="hidden sm:block">
								Create Monitor
							</span>
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
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										placeholder="Website"
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Type</Label>
									<Select
										value={type}
										onValueChange={(v) => setType(v as "http" | "tcp")}
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
									<Label>Domain / URL</Label>
									<div className="flex flex-row gap-2 items-center w-full">
										<Input
											placeholder="tygr.dev"
											disabled={loading}
											value={url}
											onChange={(e) =>
												setUrl(e.target.value)
											}
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleMonitorTest}
										>
											Test
										</Button>
									</div>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Interval</Label>
									<Select
										defaultValue="5"
										name="interval"
										disabled={loading}
										value={interval}
										onValueChange={(v) => setInterval(v)}
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
				<Alert
					title="Are you sure?"
					description={`The test ping to ${url} failed. Do you want to save anyway?`}
					open={brokenWarning}
					setOpen={setBrokenWarning}
					onCancel={() => {
						setBrokenWarning(false);
						setLoading(false);
					}}
					onSubmit={() => {
						handleMonitorCreate();
						setLoading(false);
						setBrokenWarning(false);
					}}
				/>
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerTrigger asChild>
						<Button size="icon">
							<PlusIcon />
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
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										placeholder="Website"
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Type</Label>
									<Select
										value={type}
										onValueChange={(v) => setType(v as "http" | "tcp")}
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
									<Label>Domain / URL</Label>
									<div className="flex flex-row gap-2 items-center w-full">
										<Input
											placeholder="tygr.dev"
											disabled={loading}
											value={url}
											onChange={(e) =>
												setUrl(e.target.value)
											}
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleMonitorTest}
										>
											Test
										</Button>
									</div>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Interval</Label>
									<Select
										defaultValue="5"
										name="interval"
										disabled={loading}
										value={interval}
										onValueChange={(v) => setInterval(v)}
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
