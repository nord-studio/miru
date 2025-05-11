"use client";

import { createApiKey } from "@/components/settings/api/actions";
import { Button } from "@/components/ui/button";
import { CopyToClipboardInput } from "@/components/ui/copy-input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { generateId } from "@/lib/utils";
import { ApiKeyPermissions } from "@/types/api";
import { Workspace } from "@/types/workspace";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

function ApiKeyMessage({ open, setOpen, apiKey }: { open: boolean, setOpen: (open: boolean) => void, apiKey: string }) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Your API Key</DialogTitle>
							<DialogDescription>
								Please take note of your API key. You will not be able to see it again.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col px-6 gap-4">
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Key</Label>
								<CopyToClipboardInput content={apiKey} />
							</div>
							<span className="text-sm text-neutral-500 dark:text-neutral-400 items-center">
								To learn how to use the Miru API, please take a look at our {" "}
								<Link href="https://miru.nordstud.io/docs/api/" target="_blank">
									<span className="text-blue-400 dark:text-blue-500">
										documentation
									</span>
								</Link>
								.
							</span>
						</div>
						<div className="flex flex-row gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4 rounded-b-lg">
							<DialogClose asChild>
								<Button
									variant="outline"
									type="button"
								>
									Close
								</Button>
							</DialogClose>
						</div>
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
							<DrawerTitle>Your API Key</DrawerTitle>
							<DrawerDescription>
								Please take note of your API key. You will not be able to see it again.
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex flex-col px-4 pb-6 pt-2 gap-4">
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Key</Label>
								<CopyToClipboardInput content={apiKey} />
							</div>
						</div>
						<div className="flex flex-row w-full gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
							<DrawerClose asChild>
								<Button
									variant="outline"
									type="button"
								>
									Close
								</Button>
							</DrawerClose>
						</div>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}

const permissionList = [
	{ value: "create", label: "Create" },
	{ value: "read", label: "Read" },
	{ value: "update", label: "Update" },
	{ value: "delete", label: "Delete" }
];

export default function CreateApiKey({ workspace, children }: { workspace: Workspace, children: React.ReactNode }) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [loading, setLoading] = React.useState(false);
	const [finished, setFinished] = React.useState(false);
	const [key, setKey] = React.useState(generateId());

	const [name, setName] = React.useState("");
	const [expiresIn, setExpiresIn] = React.useState<"none" | "7d" | "30d" | "60d" | "90d">("30d");

	const [monitorPerms, setMonitorPerms] = React.useState<string[]>([]);
	const [incidentPerms, setIncidentPerms] = React.useState<string[]>([]);
	const [pagePerms, setPagePerms] = React.useState<string[]>([]);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		if (name.length < 3) {
			setLoading(false);
			return toast.error("Invalid name", {
				description: "Name must be at least 3 characters long."
			});
		}

		if (monitorPerms.length === 0 && incidentPerms.length === 0 && pagePerms.length === 0) {
			setLoading(false);
			return toast.error("Missing permissions", {
				description: "You must select at least one permission."
			});
		}

		const t = toast.loading("Creating key...");

		await createApiKey({
			name: name,
			workspaceId: workspace.id,
			expires: expiresIn,
			permissions: {
				monitors: monitorPerms as ApiKeyPermissions["monitors"],
				incidents: incidentPerms as ApiKeyPermissions["incidents"],
				pages: pagePerms as ApiKeyPermissions["pages"],
			},
			key: key
		}).then((res) => {
			if (res?.validationErrors) {
				setLoading(false);
				return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
					id: t
				});
			}

			if (res?.data?.error) {
				setLoading(false);
				return toast.error("Something went wrong!", {
					description: res.data.message,
					id: t
				});
			}

			if (res?.serverError) {
				setLoading(false);
				return toast.error("Something went wrong!", {
					description: res.serverError,
					id: t
				});
			}

			if (!res?.data?.key) {
				return toast.error("Something went wrong!", {
					description: "Failed to retrieve key.",
					id: t
				})
			}

			setLoading(false);
			toast.success("Success!", {
				description: "Your API key has been created.",
				id: t
			});

			// Open the message dialog
			setFinished(true);

			// Reset the state
			setOpen(false);
		});
	}

	if (isDesktop) {
		return (
			<>
				<ApiKeyMessage open={finished} setOpen={setFinished} apiKey={key} />
				<Dialog open={open} onOpenChange={() => {
					if (open === false) {
						setOpen(!open);
						setName("");
						setKey(generateId());
						setExpiresIn("30d");
						setMonitorPerms([]);
						setIncidentPerms([]);
						setPagePerms([]);
					} else {
						setOpen(!open);
					}
				}}>
					<DialogTrigger asChild>
						{children}
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Create API Key</DialogTitle>
							<DialogDescription>
								Remember to keep your API key safe. You can always revoke it later.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-5">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company Site" />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Expires in</Label>
									<Select
										value={expiresIn}
										onValueChange={(v) => setExpiresIn(v as "none" | "7d" | "30d" | "60d" | "90d")}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="none" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="7d">
												7 Days
											</SelectItem>
											<SelectItem value="30d">
												30 Days
											</SelectItem>
											<SelectItem value="60d">
												60 Days
											</SelectItem>
											<SelectItem value="90d">
												90 Days
											</SelectItem>
											<SelectItem value="none">
												No Expiration
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Monitor Permissions</Label>
									<MultiSelect
										options={permissionList}
										value={monitorPerms}
										onValueChange={setMonitorPerms}
										defaultValue={monitorPerms}
										placeholder="Select permissions"
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Incident Permissions</Label>
									<MultiSelect
										options={permissionList}
										onValueChange={setIncidentPerms}
										defaultValue={incidentPerms}
										placeholder="Select permissions"
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Status Page Permissions</Label>
									<MultiSelect
										options={permissionList}
										onValueChange={setPagePerms}
										defaultValue={pagePerms}
										placeholder="Select permissions"
									/>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4 rounded-b-lg">
								<DialogClose asChild>
									<Button
										variant="outline"
										type="button"
									>
										Cancel
									</Button>
								</DialogClose>
								<Button
									type="submit"
									disabled={loading}
								>
									{loading ? "Creating" : "Create"}
									{loading && <Spinner />}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog >
			</>
		);
	} else {
		return (
			<>
				<ApiKeyMessage open={finished} setOpen={setFinished} apiKey={key} />
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerTrigger asChild>
						{children}
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Create Invite Token</DrawerTitle>
							<DrawerDescription>
								Create an invite token to invite a user to this workspace.
							</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-5">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Name</Label>
									<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company Site" />
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Expires in</Label>
									<Select
										value={expiresIn}
										onValueChange={(v) => setExpiresIn(v as "none" | "7d" | "30d" | "60d" | "90d")}
										disabled={loading}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="none" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="7d">
												7 Days
											</SelectItem>
											<SelectItem value="30d">
												30 Days
											</SelectItem>
											<SelectItem value="60d">
												60 Days
											</SelectItem>
											<SelectItem value="90d">
												90 Days
											</SelectItem>
											<SelectItem value="none">
												No Expiration
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Monitor Permissions</Label>
									<MultiSelect
										options={permissionList}
										value={monitorPerms}
										onValueChange={setMonitorPerms}
										defaultValue={monitorPerms}
										placeholder="Select permissions"
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Incident Permissions</Label>
									<MultiSelect
										options={permissionList}
										onValueChange={setIncidentPerms}
										defaultValue={incidentPerms}
										placeholder="Select permissions"
									/>
								</div>
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Status Page Permissions</Label>
									<MultiSelect
										options={permissionList}
										onValueChange={setPagePerms}
										defaultValue={pagePerms}
										placeholder="Select permissions"
									/>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4 rounded-b-lg">
								<DrawerClose asChild>
									<Button
										variant="outline"
										type="button"
									>
										Cancel
									</Button>
								</DrawerClose>
								<Button
									type="submit"
									disabled={loading}
								>
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