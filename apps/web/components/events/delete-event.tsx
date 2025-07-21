"use client";

import { deleteEvents } from "@/components/events/actions";
import Alert from "@/components/ui/alert";
import { EventWithMonitors } from "@miru/types";

export default function DeleteEvents({
	open,
	setOpen,
	events,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	events: EventWithMonitors[];
}) {
	return (
		<Alert
			title={events.length > 1 ? "Delete events?" : "Delete Event?"}
			description={`Are you sure you want to delete ${events.length > 1 ? "these events" : "this event"}? This action cannot be undone.`}
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteEvents(events.map((event) => event.id));
				return;
			}}
		/>
	);
}
