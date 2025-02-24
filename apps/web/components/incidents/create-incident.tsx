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
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import React from "react";
import { createIncident } from "@/components/incidents/actions";
import { IncidentStatus } from "@/types/incident";
import { Textarea } from "@/components/ui/textarea";
import { Monitor } from "@/types/monitor";
import MonitorSelection from "@/components/incidents/monitor-select";

export default function CreateIncident({
	monitors,
}: {
	monitors: Omit<Monitor, "uptime">[];
}) {
	const [open, setOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);
	const [mounted, setMounted] = useState(false);

	const [title, setTitle] = useState("");
	const [monitorIds, setMonitorIds] = useState<string[]>([]);
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState<IncidentStatus>(
		IncidentStatus.INVESTIGATING
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData();
		data.append("title", title);
		data.append("message", message);
		data.append("status", status);
		for (const id of monitorIds) {
			data.append("monitorIds", id);
		}

		createIncident({ error: false, message: "" }, data).then((res) => {
			setLoading(false);
			if (res.error) {
				toast.error(res.message);
			} else {
				toast.success("Monitor created successfully.");
				setOpen(!open);
			}
		});
	}

	if (!mounted)
		return (
			<>
				<Button>
					<PlusIcon />
					<span className="hidden sm:block">Create Incident</span>
				</Button>
			</>
		);

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusIcon />
							<span className="hidden sm:block">
								Create Incident
							</span>
						</Button>
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Create Incident</DialogTitle>
							<DialogDescription>
								Inform your users about what just happened.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Title</Label>
									<Input
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										placeholder="Monitoring service won't start"
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Affected Monitors</Label>
									<MonitorSelection
										monitors={monitors}
										value={monitorIds}
										setValue={setMonitorIds}
										min={1}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Status</Label>
									<Select
										value={status}
										onValueChange={(v: IncidentStatus) =>
											setStatus(v)
										}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={
													IncidentStatus.INVESTIGATING
												}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												value={
													IncidentStatus.INVESTIGATING
												}
											>
												Investigating
											</SelectItem>
											<SelectItem
												value={
													IncidentStatus.IDENTIFIED
												}
											>
												Identified
											</SelectItem>
											<SelectItem
												value={
													IncidentStatus.MONITORING
												}
											>
												Monitoring
											</SelectItem>
											<SelectItem
												value={IncidentStatus.RESOLVED}
											>
												Resolved
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label htmlFor="message">
										Your message
									</Label>
									<Textarea
										placeholder="Type your message here."
										value={message}
										onChange={(e) =>
											setMessage(e.target.value)
										}
									/>
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
						<Button size="icon">
							<PlusIcon />
						</Button>
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Create Incident</DrawerTitle>
							<DrawerDescription>
								Inform your users about what just happened.
							</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Title</Label>
									<Input
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										placeholder="Website"
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Affected Monitors</Label>
									<MonitorSelection
										monitors={monitors}
										value={monitorIds}
										setValue={setMonitorIds}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Status</Label>
									<Select
										value={status}
										onValueChange={(v: IncidentStatus) =>
											setStatus(v)
										}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={
													IncidentStatus.INVESTIGATING
												}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												value={
													IncidentStatus.INVESTIGATING
												}
											>
												Investigating
											</SelectItem>
											<SelectItem
												value={
													IncidentStatus.IDENTIFIED
												}
											>
												Identified
											</SelectItem>
											<SelectItem
												value={
													IncidentStatus.MONITORING
												}
											>
												Monitoring
											</SelectItem>
											<SelectItem
												value={IncidentStatus.RESOLVED}
											>
												Resolved
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label htmlFor="message">
										Your message
									</Label>
									<Textarea
										placeholder="Type your message here."
										className="h-32"
										value={message}
										onChange={(e) =>
											setMessage(e.target.value)
										}
									/>
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
										{loading ? <Spinner /> : "Create"}
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
