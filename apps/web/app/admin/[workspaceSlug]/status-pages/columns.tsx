/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages";
import StatusPageDropdown from "@/components/status-pages/status-page-dropdown";

export const columns: ColumnDef<StatusPageWithMonitorsExtended>[] = [
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
			const pathname = usePathname();
			return (
				<Link
					href={`/admin/${pathname.split("/")[2]}/status-pages/${row.original.id}`}
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
		accessorKey: "domain",
		header: "Domain",
		cell: ({ row }) => {
			let root: string | null = null;
			if (typeof window !== "undefined") {
				root = process.env.NODE_ENV === "development" ? `http://${window.location.host}` : `https://${window.location.host}`
			}
			const [mounted, setMounted] = React.useState(false);

			React.useEffect(() => {
				setMounted(true);
			}, [])

			if (!mounted) {
				return <Skeleton className="h-5 w-24" />;
			}

			return (
				<Link
					href={row.original.root ? root ?? "" : `https://${row.original.domain}`}
					className="w-fit flex flex-row gap-1 items-center"
					target="_blank"
				>
					<p className="font-medium hover:underline w-fit">
						{row.original.root ? root?.split("/")[2] : row.original.domain}
					</p>
					<ArrowUpRightIcon size={16} />
				</Link>
			)
		}
	},
	{
		accessorKey: "enabled",
		header: "Enabled",
		cell: ({ row }) => {
			return (
				<span className="font-medium">
					{row.original.enabled ? "Yes" : "No"}
				</span>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<StatusPageDropdown
					statusPage={row.original}
					workspaceId={row.original.workspaceId}
					className="h-8 w-8 p-0"
				/>
			);
		},
	},
];
