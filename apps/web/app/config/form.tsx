"use client";

import { updateConfig } from "@/app/config/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MiruConfig } from "@miru/types";
import { HelpCircle, Save } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

export default function InstanceConfigForm({ config }: { config: MiruConfig }) {
	const [enableEmail, setEnableEmail] = React.useState(config.email.enabled);
	const [emailVerification, setEmailVerification] = React.useState(config.email.verification);
	const [autoIncidents, setAutoIncidents] = React.useState(config.incidents.auto.enabled);
	const [maxStorageSize, setMaxStorageSize] = React.useState(config.storage.max_size);
	const [workspaceCreation, setWorkspaceCreation] = React.useState(config.workspace.creation);
	const [deleteOnEmpty, setDeleteOnEmpty] = React.useState(config.users.delete_on_empty);
	const [pingsThreshold, setPingsThreshold] = React.useState(config.incidents.auto.pings_threshold);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const t = toast.loading("Updating configuration...");

		const res = await updateConfig({
			email: {
				enabled: enableEmail,
				verification: emailVerification,
			},
			incidents: {
				auto: {
					enabled: autoIncidents,
					pings_threshold: pingsThreshold,
				},
			},
			storage: {
				max_size: maxStorageSize,
			},
			users: {
				delete_on_empty: deleteOnEmpty
			},
			workspace: {
				creation: workspaceCreation
			}
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
			description: "Configuration updated successfully.",
			id: t
		});
	};

	return (
		<form className="flex flex-col gap-3 items-start w-full" onSubmit={onSubmit}>
			<div className="flex flex-row gap-2 items-center justify-between p-3 w-full border rounded-md">
				<div className="flex flex-col gap-0">
					<div className="flex flex-row gap-2 items-center">
						<h3 className="font-semibold font-display">
							Enable Email
						</h3>
						<Link href="https://miru.nordstud.io/docs/configuration#email" target="_blank">
							<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
						</Link>
					</div>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						Completely toggle email functionality in Miru.
					</p>
				</div>
				<Switch checked={enableEmail} onCheckedChange={() => setEnableEmail(!enableEmail)} />
			</div>
			<div className="flex flex-row gap-2 items-center justify-between p-3 w-full border rounded-md">
				<div className="flex flex-col gap-0">
					<div className="flex flex-row gap-2 items-center">
						<h3 className="font-semibold font-display">
							Email Verification
						</h3>
						<Link href="https://miru.nordstud.io/docs/configuration#email" target="_blank">
							<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
						</Link>
					</div>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						If enabled, users will be required to verify their email address before they can log in.
					</p>
				</div>
				<Switch checked={emailVerification} onCheckedChange={() => setEmailVerification(!emailVerification)} />
			</div>
			<div className="flex flex-row gap-2 items-center justify-between p-3 w-full border rounded-md">
				<div className="flex flex-col gap-0">
					<div className="flex flex-row gap-2 items-center">
						<h3 className="font-semibold font-display">
							Auto Incidents
						</h3>
						<Link href="https://miru.nordstud.io/docs/configuration#incidentsauto" target="_blank">
							<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
						</Link>
					</div>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						Whether to automatically create incidents when monitor goes down.
					</p>
				</div>
				<Switch checked={autoIncidents} onCheckedChange={() => setAutoIncidents(!autoIncidents)} />
			</div>
			{autoIncidents && (
				<div className="flex flex-row gap-2 items-center justify-between p-3 w-full border rounded-md">
					<div className="flex flex-col gap-0">
						<div className="flex flex-row gap-2 items-center">
							<h3 className="font-semibold font-display">
								Pings Threshold
							</h3>
							<Link href="https://miru.nordstud.io/docs/configuration#incidentsauto" target="_blank">
								<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
							</Link>
						</div>
						<p className="text-sm text-neutral-500 dark:text-neutral-400">
							The amount of pings needed before action can be taken on auto incidents.
						</p>
					</div>
					<Input type="number" className="w-1/3" value={pingsThreshold} onChange={(e) => setPingsThreshold(parseInt(e.target.value))} />
				</div>
			)}
			<div className="flex flex-row gap-2 items-center justify-between p-3 w-full border rounded-md">
				<div className="flex flex-col gap-0">
					<div className="flex flex-row gap-2 items-center">
						<h3 className="font-semibold font-display">
							Max Storage Size
						</h3>
						<Link href="https://miru.nordstud.io/docs/configuration#incidentsauto" target="_blank">
							<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
						</Link>
					</div>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						The maximum size of the file that can be uploaded to the S3 bucket, in bytes.
					</p>
				</div>
				<Input type="number" className="w-1/3" value={maxStorageSize} onChange={(e) => setMaxStorageSize(parseInt(e.target.value))} />
			</div>
			<div className="flex flex-row gap-2 items-center justify-between p-3 w-full border rounded-md">
				<div className="flex flex-col gap-0">
					<div className="flex flex-row gap-2 items-center">
						<h3 className="font-semibold font-display">
							Workspace Creation
						</h3>
						<Link href="https://miru.nordstud.io/docs/configuration#workspace" target="_blank">
							<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
						</Link>
					</div>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						Allow any registered user to create a workspace.
					</p>
				</div>
				<Switch checked={workspaceCreation} onCheckedChange={() => setWorkspaceCreation(!workspaceCreation)} />
			</div>
			<div className="flex flex-row gap-2 items-center justify-between p-3 w-full border rounded-md">
				<div className="flex flex-col gap-0">
					<div className="flex flex-row gap-2 items-center">
						<h3 className="font-semibold font-display">
							Auto Delete Users
						</h3>
						<Link href="https://miru.nordstud.io/docs/configuration#users" target="_blank">
							<HelpCircle className="size-4 text-neutral-500 dark:text-neutral-400" />
						</Link>
					</div>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						When enabled, users will be automatically deleted if they don&apos;t belong to any workspace.
					</p>
				</div>
				<Switch checked={deleteOnEmpty} onCheckedChange={() => setDeleteOnEmpty(!deleteOnEmpty)} />
			</div>
			<div className="flex flex-row gap-2 items-center justify-end w-full">
				<Button>
					<Save /> Update
				</Button>
			</div>
		</form>
	)
}