"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { pingMonitor } from "@/components/monitors/actions";
import React from "react";
import EditMonitor from "@/components/monitors/edit-monitor";
import DeleteMonitor from "@/components/monitors/delete-monitor";
import { Monitor } from "@/types/monitor";
import { testUrl } from "@/components/monitors/utils";
import { VariantProps } from "class-variance-authority";

export default function MonitorActionsDropdown({
	monitor,
	...props
}: {
	monitor: Omit<Monitor, "uptime">;
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>) {
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);

	return (
		<>
			<div className="w-full flex-row flex justify-end">
				<DeleteMonitor
					open={deleteOpen}
					setOpen={setDeleteOpen}
					id={monitor.id}
				/>
				<EditMonitor
					monitor={monitor}
					open={editOpen}
					setOpen={setEditOpen}
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild className="">
						<Button variant="ghost" {...props}>
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => setEditOpen(true)}>
							Edit
						</DropdownMenuItem>
						<Link href={`/dashboard/monitors/${monitor.id}`}>
							<DropdownMenuItem>Details</DropdownMenuItem>
						</Link>
						<DropdownMenuItem
							onClick={() =>
								toast.promise(
									testUrl(monitor.type, monitor.url),
									{
										loading: `Test Pinging ${monitor.url}`,
										success: `Connection established to ${monitor.url}!`,
										error: `Failed to ping ${monitor.url}. Is the domain correct?`,
									}
								)
							}
						>
							Test
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={async () => {
								const t = toast.loading(
									`Pinging ${monitor.url}...`
								);

								await pingMonitor(monitor.id).then((res) => {
									if (res.error) {
										toast.error(res.message, {
											id: t,
										});
									} else {
										toast.success(res.message, {
											id: t,
										});
									}
								});
							}}
						>
							Ping
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(monitor.id);
								toast("Copied ID to clipboard.");
							}}
						>
							Copy ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-red-500 hover:text-black dark:hover:text-white hover:bg-red-500 dark:hover:bg-red-600"
							onClick={() => {
								setDeleteOpen(true);
							}}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}
