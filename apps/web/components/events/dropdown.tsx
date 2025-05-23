"use client";

import { MoreHorizontal, Trash } from "lucide-react";
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
import { getAllMonitors } from "@/components/monitors/actions";
import { EventWithMonitors } from "@/types/event";
import EditEvent from "@/components/events/edit-event";
import DeleteEvent from "@/components/events/delete-event";

export default function EventActionsDropdown({
	event,
	monitors,
	...props
}: {
	event: EventWithMonitors;
	monitors?: Monitor[];
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>) {
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [allMonitors, setAllMonitors] = React.useState<
		Monitor[]
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
				<DeleteEvent
					id={event.id}
					open={deleteOpen}
					setOpen={setDeleteOpen}
				/>
				<EditEvent
					event={event}
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
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(event.id);
								toast("Copied ID to clipboard.");
							}}
						>
							Copy ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => {
								setDeleteOpen(true);
							}}
						>
							<Trash /> Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}
