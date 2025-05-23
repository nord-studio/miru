"use client";

import { deleteEvent } from "@/components/events/actions";
import Alert from "@/components/ui/alert";

export default function DeleteEvent({
	open,
	setOpen,
	id,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	id: string;
}) {
	return (
		<Alert
			title="Delete Event?"
			description="Are you sure you want to delete this event? This action cannot be undone."
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteEvent({ id });
				return;
			}}
		/>
	);
}
