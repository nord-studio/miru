/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { IncidentWithMonitor } from "@/types/incident";
import { Badge } from "@/components/ui/badge";
import IncidentActionsDropdown from "@/components/incidents/incidents-dropdown";
import { usePathname } from "next/navigation";

export const columns: ColumnDef<IncidentWithMonitor>[] = [
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
			const pathname = usePathname();
			return (
				<Link
					href={`/admin/${pathname.split("/")[2]}/incidents/${row.original.id
						}`}
					className="w-fit"
				>
					<p className="font-medium hover:underline w-fit">
						{row.original.title}
					</p>
				</Link>
			);
		},
	},
	{
		accessorKey: "started_at",
		header: "Started At",
		cell: ({ row }) => {
			return (
				<p className="font-medium" suppressHydrationWarning={true}>
					{new Date(row.original.started_at).toLocaleString()}
				</p>
			);
		},
	},
	{
		accessorKey: "acknowledged_at",
		header: "Acknowledged At",
		cell: ({ row }) => {
			return (
				<p className="font-medium" suppressHydrationWarning={true}>
					{row.original.acknowledged_at
						? new Date(
							row.original.acknowledged_at
						).toLocaleString()
						: "N/A"}
				</p>
			);
		},
	},
	{
		accessorKey: "resolved_at",
		header: "Resolved At",
		cell: ({ row }) => {
			return (
				<p className="font-medium" suppressHydrationWarning={true}>
					{row.original.resolved_at
						? new Date(row.original.resolved_at).toLocaleString()
						: "N/A"}
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
								<Badge className="mx-1 hover:opacity-80 transiot">
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
				<IncidentActionsDropdown
					incident={row.original}
					className="h-8 w-8 p-0"
				/>
			);
		},
	},
];
