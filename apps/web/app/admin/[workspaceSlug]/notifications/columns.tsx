"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { NotificationWithMonitors } from "@miru/types";
import NotificationActionsDropdown from "@/components/notifications/dropdown";

export const columns: ColumnDef<NotificationWithMonitors>[] = [
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
				<p className="font-medium w-fit">
					{row.original.name}
				</p>
			);
		},
	},
	{
		accessorKey: "provider",
		header: "Provider",
		cell: ({ row }) => {
			return (
				<Badge>
					{row.original.provider[0].toUpperCase() +
						row.original.provider.slice(1)}
				</Badge>
			)
		},
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			return (
				<p className="font-medium w-fit">
					{row.original.type[0].toUpperCase() +
						row.original.type.slice(1)}
				</p>
			);
		},
	},
	{
		accessorKey: "monitors",
		header: "Monitors",
		cell: ({ row }) => {
			return (
				<>
					{row.original.monitors.map((mon) => (
						<Link href={`/admin/${usePathname().split("/")[2]}/monitors/${mon.id}`} key={mon.id}>
							<Badge
								className="mr-1"
							>
								{mon.name}
							</Badge>
						</Link>
					))}
				</>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<NotificationActionsDropdown
					notification={row.original}
					workspaceId={row.original.workspaceId}
					className="h-8 w-8 p-0"
				/>
			);
		},
	},
];
