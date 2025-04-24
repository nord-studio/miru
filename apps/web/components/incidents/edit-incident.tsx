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
import { IncidentWithMonitor } from "@/types/incident";
import { editIncident } from "@/components/incidents/actions";
import MonitorSelection from "@/components/monitors/monitor-select";
import { Monitor } from "@/types/monitor";

export function EditIncidentButton({
	incident,
	monitors,
	...props
}: {
	incident: IncidentWithMonitor;
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
					<span className="hidden sm:inline">Edit Incident</span>
				</Button>
			</>
		);
	}

	return (
		<>
			<Button onClick={() => setOpen(!open)} {...props}>
				<Pen />
				<span className="hidden sm:inline">Edit Incident</span>
			</Button>
			<EditIncident
				open={open}
				setOpen={setOpen}
				incident={incident}
				monitors={monitors}
			/>
		</>
	);
}

export default function EditIncident({
	incident,
	monitors,
	open,
	setOpen,
}: {
	incident: IncidentWithMonitor;
	monitors: Monitor[];
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState(incident.title);
	const [monitorList, setMonitorList] = useState<Monitor[]>(incident.monitors.map((m) => m));

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const res = await editIncident({
			id: incident.id,
			data: { title, monitors: monitorList.map((m) => m.id) },
		});

		if (res?.serverError) {
			setLoading(false);
			return toast.error(res.serverError);
		}

		if (res?.validationErrors) {
			setLoading(false);
			return toast.error(res.validationErrors._errors?.join(", "));
		}

		if (res?.data?.error) {
			setLoading(false);
			return toast.error(res.data.message);
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
							<DialogTitle>Edit Incident</DialogTitle>
							<DialogDescription>
								Update the details below to update your monitor.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Title</Label>
									<Input
										placeholder={incident.title}
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
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
									<Label>Title</Label>
									<Input
										placeholder={incident.title}
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										disabled={loading}
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Affected Monitors</Label>
									<MonitorSelection
										monitors={monitors}
										value={monitorList}
										setValue={setMonitorList}
										min={1}
									/>
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
