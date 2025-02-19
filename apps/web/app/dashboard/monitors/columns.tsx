"use client";

import { Monitor } from "@/types/monitor";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import MonitorActionsDropdown from "@/components/monitors/actions-dropdown";

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
			const monitor: Omit<Monitor, "uptime"> = {
				id: row.original.id,
				name: row.original.name,
				url: row.original.url,
				type: row.original.type,
				interval: row.original.interval,
				createdAt: row.original.createdAt,
				updatedAt: row.original.updatedAt,
			};
			return (
				<MonitorActionsDropdown
					monitor={monitor}
					className="h-8 w-8 p-0"
				/>
			);
		},
	},
];
