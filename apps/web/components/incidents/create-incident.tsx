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
import { Activity, Check, Fingerprint, PlusIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import React from "react";
import { createIncident } from "@/components/incidents/actions";
import { Textarea } from "@/components/ui/textarea";
import { Monitor } from "@/types/monitor";
import MonitorSelection from "@/components/monitors/monitor-select";
import { IncidentReportStatus } from "@/types/incident-report";

export default function CreateIncident({
	monitors,
}: {
	monitors: Monitor[];
}) {
	const [open, setOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);
	const [mounted, setMounted] = useState(false);

	const [title, setTitle] = useState("");
	const [monitorList, setMonitorList] = useState<Monitor[]>([]);
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState<IncidentReportStatus>(
		IncidentReportStatus.INVESTIGATING
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		createIncident({
			monitorIds: monitorList.map((m) => m.id),
			title,
			message,
			status,
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

			toast.success("Success!", {
				description: res?.data?.message
			})
			setOpen(!open)
		})
			.finally(() => setLoading(false));
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
										value={monitorList}
										setValue={setMonitorList}
										disabled={loading}
										min={1}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Status</Label>
									<Select
										value={status}
										onValueChange={(v: IncidentReportStatus) =>
											setStatus(v)
										}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={
													IncidentReportStatus.INVESTIGATING
												}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												value={
													IncidentReportStatus.INVESTIGATING
												}
											>
												<Search />
												Investigating
											</SelectItem>
											<SelectItem
												value={
													IncidentReportStatus.IDENTIFIED
												}
											>
												<Fingerprint />
												Identified
											</SelectItem>
											<SelectItem
												value={
													IncidentReportStatus.MONITORING
												}
											>
												<Activity />
												Monitoring
											</SelectItem>
											<SelectItem
												value={IncidentReportStatus.RESOLVED}
											>
												<Check />
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
										disabled={loading}
										onChange={(e) =>
											setMessage(e.target.value)
										}
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
										value={monitorList}
										setValue={setMonitorList}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Status</Label>
									<Select
										value={status}
										onValueChange={(v: IncidentReportStatus) =>
											setStatus(v)
										}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={
													IncidentReportStatus.INVESTIGATING
												}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												value={
													IncidentReportStatus.INVESTIGATING
												}
											>
												<Search />
												Investigating
											</SelectItem>
											<SelectItem
												value={
													IncidentReportStatus.IDENTIFIED
												}
											>
												<Fingerprint />
												Identified
											</SelectItem>
											<SelectItem
												value={
													IncidentReportStatus.MONITORING
												}
											>
												<Activity />
												Monitoring
											</SelectItem>
											<SelectItem
												value={IncidentReportStatus.RESOLVED}
											>
												<Check />
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
						</form>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}
