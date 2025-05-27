"use client";

import { markCompleted } from "@/components/events/actions";
import Alert from "@/components/ui/alert";

export default function CompleteEvent({
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
			title="Mark as complete?"
			description="Are you sure you want to mark this event has completed? This action cannot be undone."
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				markCompleted({ id });
				return;
			}}
		/>
	);
}
