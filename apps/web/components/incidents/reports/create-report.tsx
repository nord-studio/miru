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
import { Button } from "@/components/ui/button";
import { Activity, Check, Fingerprint, PlusIcon, Search } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import React from "react";
import { Incident } from "@/types/incident";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IncidentReportStatus } from "@/types/incident-report";
import { toast } from "sonner";
import { createIncidentReport } from "@/components/incidents/reports/actions";

export default function CreateIncidentReport({ incident }: {
	incident: Incident;
}) {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const [status, setStatus] = useState<IncidentReportStatus>(IncidentReportStatus.INVESTIGATING);
	const [message, setMessage] = useState("");

	useEffect(() => {
		setMounted(true);
	}, [])

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		const t = toast.loading("Creating report...");

		createIncidentReport({
			incidentId: incident.id,
			message,
			status: status as IncidentReportStatus,
		}).then((res) => {
			if (typeof res?.validationErrors !== "undefined") {
				return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: Object.values(res.validationErrors)[0],
					id: t
				})
			}

			if (res?.data?.error) {
				toast.error("Something went wrong!", {
					description: res.data.message,
					id: t
				})
			} else {
				toast.success("Success!", {
					description: res?.data?.message,
					id: t
				})
				setOpen(!open)
				setStatus(IncidentReportStatus.INVESTIGATING)
				setMessage("")
			}
		}).finally(() => setLoading(false))
	}

	if (!mounted)
		return (
			<>
				<Button>
					<PlusIcon />
					<span className="hidden sm:block">Create Report</span>
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
								Create Report
							</span>
						</Button>
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Create Report</DialogTitle>
							<DialogDescription>
								Please fill in the details below to create a new
								report.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
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
								{/* TODO: Add date and time select here */}
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
									<Button disabled={loading} type="submit" className="flex flex-row gap-2 items-center">
										{loading ? "Creating" : "Create"}
										{loading && <Spinner />}
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
							<DrawerTitle>Create Monitor</DrawerTitle>
							<DrawerDescription>
								Please fill in the details below to create a new
								monitor.
							</DrawerDescription>
						</DrawerHeader>
						<form>
							<div className="flex flex-col px-6 pb-4 gap-4">

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
