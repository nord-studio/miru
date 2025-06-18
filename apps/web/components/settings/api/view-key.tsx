"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { ApiKey } from "@miru/types";
import { Eye } from "lucide-react";
import React from "react";
import { useMediaQuery } from "usehooks-ts";

const permissionList = [
	{ value: "create", label: "Create" },
	{ value: "read", label: "Read" },
	{ value: "update", label: "Update" },
	{ value: "delete", label: "Delete" }
];

export default function ViewApiKey({ apiKey }: { apiKey: ApiKey }) {
	const [open, setOpen] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	React.useEffect(() => {
		setMounted(true);
	}, [])

	if (!mounted) {
		return (
			<div>
				<Button size="sm" variant="outline" onClick={() => setOpen(!open)} className="md:flex hidden">
					<Eye />
					View
				</Button>
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden flex">
					<Eye />
				</Button>
			</div>
		)
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button size="sm" variant="outline" onClick={() => setOpen(!open)} className="md:flex hidden">
							<Eye />
							View
						</Button>
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>{apiKey.name}</DialogTitle>
							<DialogDescription>
								Please find the permissions the API key <b>{apiKey.name}</b> has access to below.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col px-6 py-2 gap-5">
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Monitor Permissions</Label>
								<MultiSelect
									options={permissionList}
									defaultValue={apiKey.permissions.monitors}
									onValueChange={() => { }}
									disabled
								/>
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Incident Permissions</Label>
								<MultiSelect
									options={permissionList}
									defaultValue={apiKey.permissions.incidents}
									onValueChange={() => { }}
									disabled
								/>
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Status Page Permissions</Label>
								<MultiSelect
									options={permissionList}
									defaultValue={apiKey.permissions.pages}
									onValueChange={() => { }}
									disabled
								/>
							</div>
						</div>
						<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4 rounded-b-lg">
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
					<DrawerTrigger asChild>
						<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden flex">
							<Eye />
						</Button>
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>{apiKey.name}</DrawerTitle>
							<DrawerDescription>
								Please find the permissions the API key <b>{apiKey.name}</b> has access to below.
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex flex-col px-4 pt-2 pb-6 gap-5">
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Monitor Permissions</Label>
								<MultiSelect
									options={permissionList}
									defaultValue={apiKey.permissions.monitors}
									onValueChange={() => { }}
									disabled
								/>
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Incident Permissions</Label>
								<MultiSelect
									options={permissionList}
									defaultValue={apiKey.permissions.incidents}
									onValueChange={() => { }}
									disabled
								/>
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<Label>Status Page Permissions</Label>
								<MultiSelect
									options={permissionList}
									defaultValue={apiKey.permissions.pages}
									onValueChange={() => { }}
									disabled
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
						</div>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}