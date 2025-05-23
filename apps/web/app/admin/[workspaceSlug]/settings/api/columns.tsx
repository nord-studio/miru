/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { ApiKey } from "@/types/api";
import { format, formatDistance } from "date-fns";
import ViewApiKey from "@/components/settings/api/view-key";
import DeleteApiKey from "@/components/settings/api/revoke-key";

export const columns: ColumnDef<ApiKey>[] = [
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
				<p className="font-medium hover:underline w-fit">
					{row.original.name}
				</p>
			);
		},
	},
	{
		accessorKey: "expiresAt",
		header: "Expires In",
		cell: ({ row }) => {
			return (
				<p className="font-medium" suppressHydrationWarning={true}>
					{row.original.expiresAt ? formatDistance(new Date(), row.original.expiresAt) : "Never"}
				</p>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => {
			return (
				<p>
					{format(row.original.createdAt, "dd-MM-yyyy")}
				</p>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<div className="flex flex-row gap-2 items-center justify-end">
					<ViewApiKey apiKey={row.original} />
					<DeleteApiKey id={row.original.id} />
				</div>
			);
		},
	},
];
