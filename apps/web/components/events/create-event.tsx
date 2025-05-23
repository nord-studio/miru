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
import { Check, HelpCircle, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import MonitorSelection from "@/components/monitors/monitor-select";
import { Monitor } from "@/types/monitor";
import DateTimePicker from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { createEvent } from "@/components/events/actions";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export function CreateEventButton({ monitors }: { monitors: Monitor[] }) {
	const [open, setOpen] = React.useState(false);

	return (
		<>
			<CreateEvent open={open} setOpen={setOpen} monitors={monitors} />
			<Button onClick={() => setOpen(!open)} className="hidden xs:flex">
				<Plus />
				Create Event
			</Button>
			<Button size="icon" onClick={() => setOpen(!open)} className="flex xs:hidden">
				<Plus />
			</Button>
		</>
	)
}

export default function CreateEvent({ open, setOpen, monitors }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, monitors: Monitor[] }) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);

	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [monitorList, setMonitorList] = useState<Monitor[]>([]);
	const [scheduledFor, setScheduledFor] = useState<Date>(new Date());
	const [duration, setDuration] = useState<number>(0);
	const [autoComplete, setAutoComplete] = useState<boolean>(true);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const t = toast.loading("Creating event...");

		const res = await createEvent({
			title,
			message,
			monitorIds: monitorList.map((monitor) => monitor.id),
			autoComplete,
			duration,
			startsAt: scheduledFor,
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
							<DialogTitle>Create Event</DialogTitle>
							<DialogDescription>
								Please fill in the details below to create a new
								event.
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
									<Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} />
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
							<DrawerTitle>Create Event</DrawerTitle>
							<DrawerDescription>
								Please fill in the details below to create a new
								event.
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
