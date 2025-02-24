import CreateIncident from "@/components/incidents/create-incident";
import { DataTable } from "@/components/ui/data-table";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { IncidentWithMonitor } from "@/types/incident";
import { columns } from "@/app/dashboard/incidents/columns";
import React from "react";

export default async function IncidentsPage() {
	const mons = await db.select().from(monitors);
	const data = await db.query.monitorsToIncidents.findMany({
		with: {
			monitor: true,
			incident: true,
		},
	});

	// group together incidents with their monitors as a list
	// oh my god this is so ugly 😭
	const incids = data.reduce((acc: IncidentWithMonitor[], curr) => {
		const found = acc.find((a) => a.id === curr.incident.id);
		if (!found) {
			acc.push({
				...curr.incident,
				monitors: [curr.monitor],
			});
		} else {
			found.monitors.push(curr.monitor);
		}
		return acc;
	}, [] as IncidentWithMonitor[]);

	return (
		<>
			<div className="flex flex-col w-full h-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Incidents
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							The full list of all your incidents.
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						<CreateIncident monitors={mons} />
					</div>
				</div>
				<div className="container mx-auto mt-4">
					<DataTable columns={columns} data={incids} />
				</div>
			</div>
		</>
	);
}
