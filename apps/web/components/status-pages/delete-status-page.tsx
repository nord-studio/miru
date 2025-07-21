"use client";

import { deleteStatusPages } from "@/components/status-pages/actions";
import Alert from "@/components/ui/alert";
import { StatusPageWithMonitorsExtended } from "@miru/types";
import { usePathname, useRouter } from "next/navigation";

export default function DeleteStatusPages({
	open,
	setOpen,
	pages,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	pages: StatusPageWithMonitorsExtended[];
}) {
	const pathName = usePathname();
	const router = useRouter();

	return (
		<Alert
			title={pages.length > 1 ? "Delete Status Pages?" : "Delete Status Page?"}
			description={`Are you sure you want to delete this ${pages.length > 1 ? "status pages?" : "status page?"} This action cannot be undone.`}
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteStatusPages(pages.map((page) => page.id));
				if (pathName !== `/admin/${pathName.split("/")[2]}/status-pages`) {
					router.push(`/admin/${pathName.split("/")[2]}/status-pages`);
				}
				return;
			}}
		/>
	);
}
