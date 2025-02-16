"use client";

import { Monitor } from "@/types/monitor";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpRightIcon, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import Alert from "@/components/ui/alert";
import { deleteMonitor, pingMonitor } from "@/app/dashboard/monitors/actions";
import React from "react";
import EditMonitor from "@/app/dashboard/monitors/edit-monitor";
import TestEndpoint from "@/types/monitor-service/test";
import { env } from "@/lib/env.mjs";
import { revalidatePath } from "next/cache";

async function testUrl(method: string, url: string) {
	await fetch(`${env.NEXT_PUBLIC_MONITOR_URL}/test/${method}/${url}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	}).then(async (res) => {
		const json: TestEndpoint = await res.json();

		if (json.status === 200) {
			return json;
		} else {
			throw new Error(`${url} didn't return a 200 status code.`);
		}
	});
}

function DeleteMonitor({
	open,
	setOpen,
	id,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	id: string;
}) {
	return (
		<Alert
			title="Delete Monitor"
			description="Are you sure you want to delete this monitor?"
			open={open}
			setOpen={setOpen}
			footer="This action cannot be undone."
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				return deleteMonitor(id);
			}}
		/>
	);
}

export const columns: ColumnDef<Monitor>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<div className="items-center flex">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) =>
						table.toggleAllPageRowsSelected(!!value)
					}
					aria-label="Select all"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="items-center flex">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => {
			return (
				<Link
					href={`/dashboard/monitors/${row.original.id}`}
					className="w-fit"
				>
					<p className="font-medium hover:underline w-fit">
						{row.original.name}
					</p>
				</Link>
			);
		},
	},
	{
		accessorKey: "url",
		header: "URL",
		cell: ({ row }) => {
			if (row.original.type === "http") {
				return (
					<>
						<Link
							href={`https://${row.original.url}`}
							className="w-fit flex flex-row gap-1 items-center"
							target="_blank"
						>
							<p className="font-medium hover:underline w-fit">
								{row.original.url}
							</p>
							<ArrowUpRightIcon size={16} />
						</Link>
					</>
				);
			} else {
				return (
					<>
						<p className="font-medium w-fit">{row.original.url}</p>
					</>
				);
			}
		},
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			return (
				<span className="font-medium">
					{row.original.type.toUpperCase()}
				</span>
			);
		},
	},
	{
		accessorKey: "uptime",
		header: "Uptime",
		cell: ({ row }) => {
			return <span className="font-medium">{row.original.uptime}%</span>;
		},
	},
	{
		accessorKey: "interval",
		header: "Interval",
		cell: ({ row }) => {
			return (
				<span className="font-medium">{row.original.interval}m</span>
			);
		},
	},
	// {
	// 	accessorKey: "lastPing",
	// 	header: "Last Ping",
	// 	cell: ({ row }) => {
	// 		return (
	// 			<span className="font-medium">
	// 				{Math.floor(
	// 					(Date.now() -
	// 						new Date(row.original.lastPing).getTime()) /
	// 						60000
	// 				)}
	// 				m ago
	// 			</span>
	// 		);
	// 	},
	// },
	{
		id: "actions",
		cell: ({ row }) => {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			const [open, setOpen] = React.useState(false);
			// eslint-disable-next-line react-hooks/rules-of-hooks
			const [editOpen, setEditOpen] = React.useState(false);
			return (
				<div className="w-full flex-row flex justify-end">
					<DeleteMonitor
						open={open}
						setOpen={setOpen}
						id={row.original.id}
					/>
					<EditMonitor
						monitor={row.original}
						open={editOpen}
						setOpen={setEditOpen}
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="">
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem onClick={() => setEditOpen(true)}>
								Edit
							</DropdownMenuItem>
							<Link href={`/monitors/${row.original.id}`}>
								<DropdownMenuItem>Details</DropdownMenuItem>
							</Link>
							<DropdownMenuItem
								onClick={() =>
									toast.promise(
										testUrl(
											row.original.type,
											row.original.url
										),
										{
											loading: `Test Pinging ${row.original.url}`,
											success: `Connection established to ${row.original.url}!`,
											error: `Failed to ping ${row.original.url}. Is the domain correct?`,
										}
									)
								}
							>
								Test
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={async () => {
									const t = toast.loading(
										`Pinging ${row.original.url}...`
									);

									const res = await pingMonitor(
										row.original.id
									);

									console.log(res);

									await pingMonitor(row.original.id).then(
										(res) => {
											if (res.error) {
												toast.error(res.message, {
													id: t,
												});
											} else {
												toast.success(res.message, {
													id: t,
												});
											}
										}
									);
								}}
							>
								Ping
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(
										row.original.id
									);
									toast("Copied ID to clipboard.");
								}}
							>
								Copy ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-red-500 hover:text-black dark:hover:text-white hover:bg-red-500 dark:hover:bg-red-600"
								onClick={() => {
									setOpen(true);
								}}
							>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
