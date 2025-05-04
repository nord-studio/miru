import CreateIncident from "@/components/incidents/create-incident";
import { DataTable } from "@/components/ui/data-table";
import db from "@/lib/db";
import { monitors, workspaces } from "@/lib/db/schema";
import { IncidentWithMonitor } from "@/types/incident";
import { columns } from "@/app/admin/[workspaceSlug]/incidents/columns";
import React from "react";
import { eq } from "drizzle-orm";

export default async function IncidentsPage({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;
	const workspace = await db
		.select()
		.from(workspaces)
		.where(eq(workspaces.slug, workspaceSlug))
		.limit(1)
		.then((res) => {
			return res[0];
		});

	const mons = await db
		.select()
		.from(monitors)
		.where(eq(monitors.workspaceId, workspace.id));

	let data = await db.query.monitorsToIncidents.findMany({
		with: {
			monitor: true,
			incident: true,
		},
	});

	data = data.filter((d) => d.monitor.workspaceId === workspace.id);

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
				<div className="mt-4">
					<DataTable columns={columns} data={incids} />
				</div>
			</div>
		</>
	);
}
