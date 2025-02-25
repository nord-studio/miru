import { EditIncidentButton } from "@/components/incidents/edit-incident";
import IncidentActionsDropdown from "@/components/incidents/incidents-dropdown";
import db from "@/lib/db";
import { incidentReports } from "@/lib/db/schema";
import { monitors } from "@/lib/db/schema/monitors";
import { getIncidentsWithMonitors } from "@/lib/db/utils";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import React from "react";

export default async function MonitorSingletonLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const incident = await getIncidentsWithMonitors(id);

	const latestReport = await db
		.select()
		.from(incidentReports)
		.where(eq(incidentReports.incidentId, id))
		.orderBy(desc(incidentReports.timestamp))
		.limit(1)
		.then((res) => res[0]);

	const allMonitors = await db.select().from(monitors);

	if (!incident) {
		return notFound();
	}

	return (
		<>
			<div className="w-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							{incident.title}
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Currently {latestReport.status} • Started at{" "}
							{new Date(incident.started_at).toLocaleString()}
						</p>
					</div>
					<div className="flex flex-row gap-3 items-center">
						<EditIncidentButton
							incident={incident}
							monitors={allMonitors}
						/>
						<IncidentActionsDropdown
							incident={incident}
							monitors={allMonitors}
							variant="outline"
							size="icon"
						/>
					</div>
				</div>
				<div className="container mx-auto mt-4">{children}</div>
			</div>
		</>
	);
}
