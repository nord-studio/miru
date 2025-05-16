"use client";

import { deleteNotification } from "@/components/notifications/actions";
import Alert from "@/components/ui/alert";
import { usePathname, useRouter } from "next/navigation";

export default function DeleteNotification({
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
			title="Delete Notification?"
			description="Are you sure you want to delete this notification? This action cannot be undone."
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteNotification({ id });
				if (pathName !== `/admin/${pathName.split("/")[2]}/notifications`) {
					router.push(`/admin/${pathName.split("/")[2]}/notifications`);
				}
				return;
			}}
		/>
	);
}
