"use client";

import { deleteNotifications } from "@/components/notifications/actions";
import Alert from "@/components/ui/alert";
import { NotificationWithMonitors } from "@miru/types";
import { usePathname, useRouter } from "next/navigation";

export default function DeleteNotifications({
	open,
	setOpen,
	notifications,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	notifications: NotificationWithMonitors[];
}) {
	const pathName = usePathname();
	const router = useRouter();

	return (
		<Alert
			title={notifications.length > 1 ? "Delete Notifications?" : "Delete Notification?"}
			description={`Are you sure you want to delete ${notifications.length > 1 ? "these notifications" : "this notification"}? This action cannot be undone.`}
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteNotifications(notifications.map((notif) => notif.id));
				if (pathName !== `/admin/${pathName.split("/")[2]}/notifications`) {
					router.push(`/admin/${pathName.split("/")[2]}/notifications`);
				}
				return;
			}}
		/>
	);
}
