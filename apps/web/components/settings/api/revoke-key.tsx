"use client";

import { deleteApiKey } from "@/components/settings/api/actions";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import React from "react";

export default function DeleteApiKey({
	id,
}: {
	id: string;
}) {
	const [open, setOpen] = React.useState(false);

	return (
		<>
			<Alert
				title="Delete API key?"
				description="Are you sure you want to delete this API key? This action cannot be undone."
				open={open}
				setOpen={setOpen}
				onCancel={() => setOpen(false)}
				onSubmit={() => {
					deleteApiKey({ id });
					return;
				}}
			/>
			<Button size="icon" variant="destructive" onClick={() => setOpen(!open)} className="md:hidden flex">
				<Trash />
			</Button>
			<Button size="sm" variant="destructive" onClick={() => setOpen(!open)} className="md:flex hidden">
				<Trash />
				Delete
			</Button>
		</>
	);
}
