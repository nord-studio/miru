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
import React from "react";
import { Monitor } from "@/types/monitor";
import { VariantProps } from "class-variance-authority";
import { IncidentWithMonitor } from "@/types/incident";
import EditIncident from "@/components/incidents/edit-incident";
import { getAllMonitors } from "@/components/monitors/actions";
import DeleteIncident from "@/components/incidents/delete-incident";
import { usePathname } from "next/navigation";

export default function IncidentActionsDropdown({
	incident,
	monitors,
	...props
}: {
	incident: IncidentWithMonitor;
	monitors?: Omit<Monitor, "uptime">[];
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>) {
	const pathname = usePathname();
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [allMonitors, setAllMonitors] = React.useState<
		Omit<Monitor, "uptime">[]
	>([]);

	React.useEffect(() => {
		if (monitors) {
			setAllMonitors(monitors);
		} else {
			getAllMonitors().then((res) => {
				setAllMonitors(res?.data ?? []);
			});
		}
	}, [monitors]);

	return (
		<>
			<div className="w-full flex-row flex justify-end">
				<DeleteIncident
					open={deleteOpen}
					setOpen={setDeleteOpen}
					id={incident.id}
				/>
				<EditIncident
					incident={incident}
					monitors={allMonitors}
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
						<Link
							href={`/admin/${pathname.split("/")[2]}/incidents/${incident.id
								}`}
						>
							<DropdownMenuItem>Details</DropdownMenuItem>
						</Link>
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(incident.id);
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
