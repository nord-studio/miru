"use client";

import { deleteIncidents } from "@/components/incidents/actions";
import Alert from "@/components/ui/alert";
import { IncidentWithMonitor } from "@miru/types";
import { usePathname, useRouter } from "next/navigation";

export default function DeleteIncident({
	open,
	setOpen,
	incidents,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	incidents: IncidentWithMonitor[];
}) {
	const pathName = usePathname();
	const router = useRouter();

	return (
		<Alert
			title={incidents.length > 1 ? "Delete Incidents?" : "Delete Incident?"}
			description={`Are you sure you want to delete ${incidents.length > 1 ? "these incidents?" : "this incident?"} This action cannot be undone.`}
			open={open}
			setOpen={setOpen}
			onCancel={() => setOpen(false)}
			onSubmit={() => {
				deleteIncidents(incidents.map((incident) => incident.id));
				if (pathName !== `/admin/${pathName.split("/")[2]}/incidents`) {
					router.push(`/admin/${pathName.split("/")[2]}/incidents`);
				}
				return;
			}}
		/>
	);
}
