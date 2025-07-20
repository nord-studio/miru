"use client";

import { deleteMonitor } from "@/components/monitors/actions";
import Alert from "@/components/ui/alert";
import { Monitor } from "@miru/types";
import { usePathname, useRouter } from "next/navigation";

export default function DeleteMonitor({
	open,
	setOpen,
	monitors,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	monitors: Monitor[];
}) {
	const pathName = usePathname();
	const router = useRouter();

	// I'm so sorry that I'm a perfectionist
	const title =
		monitors.length === 1
			? `Delete ${monitors[0].name}?`
			: monitors.length === 2
				? `Delete ${monitors[0].name} and ${monitors[1].name}?`
				: `Delete ${monitors
					.slice(0, -1)
					.map((monitor) => monitor.name)
					.join(", ")
				} and ${monitors[monitors.length - 1].name}?`;

	return (
		<Alert
			title={title}
			description={`Are you sure you want to delete ${monitors.length > 1 ? "these monitors" : "this monitor"}? This action cannot be undone.`}
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteMonitor(monitors.map((monitor) => monitor.id));
				if (pathName !== `/admin/${pathName.split("/")[2]}/monitors`) {
					router.push(`/admin/${pathName.split("/")[2]}/monitors`);
				}
				return;
			}}
		/>
	);
}
