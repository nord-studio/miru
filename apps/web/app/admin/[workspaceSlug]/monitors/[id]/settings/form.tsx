"use client";

import { Monitor } from "@miru/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { editMonitor, testMonitor } from "@/components/monitors/actions";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import Alert from "@/components/ui/alert";

export default function MonitorSingletonSettingsForm({
	monitor,
}: {
	monitor: Monitor;
}) {
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [brokenWarning, setBrokenWarning] = useState(false);
	const [name, setName] = useState(monitor.name);
	const [url, setUrl] = useState(monitor.url);
	const [type, setType] = useState<"http" | "tcp">(monitor.type);
	const [interval, setInterval] = useState(monitor.interval.toString());

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const t = toast.loading(`Test pinging ${url}...`);

		testMonitor({ method: type, url }).then((res) => {
			if (res?.data?.error) {
				toast.dismiss(t);
				setBrokenWarning(true);
				return;
			} else {
				toast.success(res?.data?.message, { id: t });
				handleMonitorEdit();
			}
		});
	}

	function handleMonitorEdit() {
		editMonitor({
			id: monitor.id, data: {
				name,
				type,
				url,
				interval: parseInt(interval),
			},
		}).then((res) => {
			setLoading(false);
			if (res?.data?.error) {
				toast.error("Something went wrong!", {
					description: res.data.message
				})
			} else {
				toast.success("Success!", {
					description: res?.data?.message
				})
			}
		}).finally(() => {
			setLoading(false);
		})
	}

	function handleMonitorTest() {
		if (!url || url.length < 1) {
			toast.error("Please enter a domain before testing.");
			return;
		}

		if (!type || type.length < 1) {
			toast.error("Please select a monitor type before testing.");
			return;
		}

		toast.promise(testMonitor({ method: type, url }), {
			loading: `Test Pinging ${url}...`,

		});
	}

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		<Spinner />;
	}

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
					handleMonitorEdit();
					setLoading(false);
					setBrokenWarning(false);
				}}
			/>
			<form onSubmit={onSubmit} className="py-2">
				<div className="flex flex-col gap-4">
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
							onValueChange={(value) => setType(value as "http" | "tcp")}
							disabled={loading}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={monitor.type} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="http">HTTP</SelectItem>
								<SelectItem value="tcp">TCP</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2 items-start w-full">
						<Label>URL</Label>
						<div className="flex flex-row gap-2 items-center w-full">
							<Input
								placeholder={monitor.url}
								disabled={loading}
								value={url}
								onChange={(e) => setUrl(e.target.value)}
							/>
							<Button
								variant="outline"
								onClick={handleMonitorTest}
								disabled={loading}
								type="button"
							>
								Test
							</Button>
						</div>
					</div>
					<div className="flex flex-col gap-2 items-start w-full">
						<Label>Interval</Label>
						<Select
							disabled={loading}
							value={interval}
							onValueChange={(value) => setInterval(value)}
						>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={monitor.interval.toString()}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">1 Minute</SelectItem>
								<SelectItem value="5">5 Minutes</SelectItem>
								<SelectItem value="10">10 Minutes</SelectItem>
								<SelectItem value="30">30 Minutes</SelectItem>
								<SelectItem value="60">1 Hour</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="flex flex-row items-center justify-between gap-4 mt-8">
					<div />
					<div className="flex flex-row gap-2 items-center">
						<Button
							variant="outline"
							type="button"
							disabled={loading}
							onClick={() => {
								setName(monitor.name);
								setUrl(monitor.url);
								setType(monitor.type);
								setInterval(monitor.interval.toString());
							}}
						>
							Reset
						</Button>
						<Button disabled={loading} type="submit">
							{loading ? <Spinner /> : "Update"}
						</Button>
					</div>
				</div>
			</form>
		</>
	);
}
