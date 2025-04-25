"use client";

import { deleteStatusPage } from "@/components/status-pages/actions";
import Alert from "@/components/ui/alert";
import { usePathname, useRouter } from "next/navigation";

export default function DeleteStatusPage({
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
			title="Delete Status Page?"
			description="Are you sure you want to delete this status page? This action cannot be undone."
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteStatusPage({ id });
				if (pathName !== `/admin/${pathName.split("/")[2]}/status-pages`) {
					router.push(`/admin/${pathName.split("/")[2]}/status-pages`);
				}
				return;
			}}
		/>
	);
}
