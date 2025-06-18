/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { EventWithMonitors } from "@miru/types";
import EventActionsDropdown from "@/components/events/dropdown";

export const columns: ColumnDef<EventWithMonitors>[] = [
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
		accessorKey: "title",
		header: "Title",
		cell: ({ row }) => {
			return (
				<p className="font-medium w-fit">
					{row.original.title}
				</p>
			);
		},
	},
	{
		accessorKey: "completed",
		header: "Completed",
		cell: ({ row }) => {
			return (
				<p>
					{row.original.completed ? "Yes" : "No"}
				</p>
			);
		},
	},
	{
		accessorKey: "startsAt",
		header: "Starts At",
		cell: ({ row }) => {
			return (
				<p suppressHydrationWarning={true}>
					{new Date(row.original.startsAt).toLocaleString()}
				</p>
			);
		},
	},
	{
		accessorKey: "autoComplete",
		header: "Auto Complete",
		cell: ({ row }) => {
			return (
				<p>
					{row.original.autoComplete ? "Enabled" : "Disabled"}
				</p>
			);
		},
	},
	{
		accessorKey: "monitors",
		header: "Monitor(s)",
		cell: ({ row }) => {
			const pathname = usePathname();
			return (
				<>
					{row.original.monitors.map((mon) => {
						return (
							<Link
								href={`/admin/${pathname.split("/")[2]}/monitors/${mon.id}`}
								key={mon.id}
							>
								<Badge className="mx-1 hover:opacity-80 transition-opacity duration-150">
									{mon.name}
								</Badge>
							</Link>
						);
					})}
				</>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<EventActionsDropdown
					event={row.original}
					className="h-8 w-8 p-0"
				/>
			);
		},
	},
];
