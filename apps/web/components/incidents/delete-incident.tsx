"use client";

import { deleteIncident } from "@/components/incidents/actions";
import Alert from "@/components/ui/alert";
import { usePathname, useRouter } from "next/navigation";

export default function DeleteIncident({
	open,
	setOpen,
	id,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	id: string;
}) {
	const pathName = usePathname();
	const router = useRouter();

	return (
		<Alert
			title="Delete Incident"
			description="Are you sure you want to delete this incident?"
			footer="This action cannot be undone."
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteIncident({ id });
				if (pathName !== "/dashboard/incidents") {
					router.push("/dashboard/incidents");
				}
				return;
			}}
		/>
	);
}
