"use client";

import { useState } from "react";
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

import { Button } from "@/components/ui/button";
import { Check, HelpCircle, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import MonitorSelection from "@/components/monitors/monitor-select";
import { Monitor } from "@/types/monitor";
import DateTimePicker from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { editEvent } from "@/components/events/actions";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventWithMonitors } from "@/types/event";

export function EditEventButton({ event, monitors }: { event: EventWithMonitors, monitors: Monitor[] }) {
	const [open, setOpen] = React.useState(false);

	return (
		<>
			<EditEvent open={open} setOpen={setOpen} event={event} monitors={monitors} />
			<Button onClick={() => setOpen(!open)} className="hidden xs:flex">
				<Pencil />
				Edit Event
			</Button>
			<Button size="icon" onClick={() => setOpen(!open)} className="flex xs:hidden">
				<Pencil />
			</Button>
		</>
	)
}

export default function EditEvent({ open, setOpen, event, monitors }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, event: EventWithMonitors, monitors: Monitor[] }) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);

	const [title, setTitle] = useState(event.title);
	const [message, setMessage] = useState(event.message);
	const [monitorList, setMonitorList] = useState<Monitor[]>(event.monitors);
	const [scheduledFor, setScheduledFor] = useState<Date>(event.startsAt);
	const [duration, setDuration] = useState<number>(event.duration);
	const [autoComplete, setAutoComplete] = useState<boolean>(event.autoComplete);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const t = toast.loading("Updating event...");

		if (title.length < 1) {
			toast.error("Something went wrong!", {
				description: "Title is required",
				id: t
			});
			setLoading(false);
			return;
		}

		if (message.length < 1) {
			toast.error("Something went wrong!", {
				description: "Message is required",
				id: t
			});
			setLoading(false);
			return;
		}

		if (monitorList.length < 1) {
			toast.error("Something went wrong!", {
				description: "At least 1 monitor is required",
				id: t
			});
			setLoading(false);
			return;
		}

		if (scheduledFor.getTime() < new Date().getTime()) {
			toast.error("Something went wrong!", {
				description: `Scheduled time must be in the future`,
				id: t
			});
			setLoading(false);
			return;
		}

		if (duration < 1) {
			toast.error("Something went wrong!", {
				description: "Duration must be at least 1 minute",
				id: t
			});
			setLoading(false);
			return;
		}

		const res = await editEvent({
			id: event.id,
			title: title ?? undefined,
			message: message ?? undefined,
			monitorIds: monitorList.map((monitor) => monitor.id),
			autoComplete: autoComplete ?? undefined,
			duration: duration ?? undefined,
			startsAt: scheduledFor ?? undefined,
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
			description: res?.data?.message,
			id: t
		});

		setLoading(false);
		setOpen(!open);
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Editing Event</DialogTitle>
							<DialogDescription>
								Please fill in the details below to update the exisitng event.
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
										placeholder="Moving to a new server"
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Message</Label>
									<Textarea value={message} onChange={(e) => setMessage(e.target.value)} disabled={loading} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Affected Monitors</Label>
									<MonitorSelection monitors={monitors} value={monitorList} setValue={setMonitorList} disabled={loading} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Scheduled For</Label>
									<DateTimePicker date={scheduledFor} setDate={setScheduledFor} disabled={loading} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Duration (minutes)</Label>
									<Input type="number" min={1} max={1440} value={duration} disabled={loading} onChange={(e) => {
										if (parseInt(e.target.value) > 1440) {
											setDuration(1440);
											return;
										}
										setDuration(parseInt(e.target.value))
									}
									} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<div className="flex flex-row gap-2 items-center">
										<Label>Auto Complete</Label>
										<Link href="https://miru.nordstud.io/docs/concepts/events#auto-complete" target="_blank">
											<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
										</Link>
									</div>
									<Select
										value={autoComplete === true ? "enabled" : "disabled"}
										onValueChange={(v) => setAutoComplete(v === "enabled")}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="HTTP" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="enabled">
												<Check /> Enabled
											</SelectItem>
											<SelectItem value="disabled">
												<X /> Disabled
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
							<DrawerTitle>Editing Event</DrawerTitle>
							<DrawerDescription>
								Please fill in the details below to update the exisitng event.
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
										placeholder="Moving to a new server"
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Message</Label>
									<Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Affected Monitors</Label>
									<MonitorSelection monitors={monitors} value={monitorList} setValue={setMonitorList} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Scheduled For</Label>
									<DateTimePicker date={scheduledFor} setDate={setScheduledFor} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Duration (minutes)</Label>
									<Input type="number" min={1} max={1440} value={duration} disabled={loading} onChange={(e) => {
										if (parseInt(e.target.value) > 1440) {
											setDuration(1440);
											return;
										}
										setDuration(parseInt(e.target.value))
									}
									} />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<div className="flex flex-row gap-2 items-center">
										<Label>Auto Complete</Label>
										<Link href="https://miru.nordstud.io/docs/concepts/events#auto-complete" target="_blank">
											<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
										</Link>
									</div>
									<Select
										value={autoComplete === true ? "enabled" : "disabled"}
										onValueChange={(v) => setAutoComplete(v === "enabled")}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="HTTP" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="enabled">
												<Check /> Enabled
											</SelectItem>
											<SelectItem value="disabled">
												<X /> Disabled
											</SelectItem>
										</SelectContent>
									</Select>
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
