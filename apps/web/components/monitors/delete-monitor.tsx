"use client";

import { deleteMonitor } from "@/components/monitors/actions";
import Alert from "@/components/ui/alert";
import { usePathname, useRouter } from "next/navigation";

export default function DeleteMonitor({
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
			title="Delete Monitor"
			description="Are you sure you want to delete this monitor?"
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteMonitor(id);
				if (pathName !== "/dashboard/monitors") {
					router.push("/dashboard/monitors");
				}
				return;
			}}
		/>
	);
}
