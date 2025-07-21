"use client";

import { Check, ClipboardCopy, MoreHorizontal, Pencil, Trash } from "lucide-react";
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
import { Monitor } from "@miru/types";
import { VariantProps } from "class-variance-authority";
import { getAllMonitors } from "@/components/monitors/actions";
import { EventWithMonitors } from "@miru/types";
import EditEvent from "@/components/events/edit-event";
import DeleteEvent from "@/components/events/delete-event";
import CompleteEvent from "@/components/events/complete-event";

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
	const [completeOpen, setCompleteOpen] = React.useState(false);
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

	const inProgress = event.startsAt
		? new Date(event.startsAt) <= new Date() &&
		!event.completed
		: false;

	return (
		<>
			<div className="w-full flex-row flex justify-end">
				<DeleteEvent
					events={[event]}
					open={deleteOpen}
					setOpen={setDeleteOpen}
				/>
				<EditEvent
					event={event}
					monitors={allMonitors}
					open={editOpen}
					setOpen={setEditOpen}
				/>
				<CompleteEvent
					id={event.id}
					open={completeOpen}
					setOpen={setCompleteOpen}
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
						{inProgress && (
							<DropdownMenuItem onClick={() => setCompleteOpen(true)}>
								<Check />Mark Completed
							</DropdownMenuItem>
						)}
						<DropdownMenuItem onClick={() => setEditOpen(true)} disabled={event.completed || inProgress}>
							<Pencil /> Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(event.id);
								toast("Copied ID to clipboard.");
							}}
						>
							<ClipboardCopy />Copy ID
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
