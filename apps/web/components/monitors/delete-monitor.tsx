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
			description="Are you sure you want to delete this monitor? This action cannot be undone."
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteMonitor(id);
				if (pathName !== `/admin/${pathName.split("/")[2]}/monitors`) {
					router.push(`/admin/${pathName.split("/")[2]}/monitors`);
				}
				return;
			}}
		/>
	);
}
