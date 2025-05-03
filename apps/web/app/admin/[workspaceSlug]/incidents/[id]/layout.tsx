import CreateIncidentReport from "@/components/incidents/reports/create-report";
import IncidentActionsDropdown from "@/components/incidents/incidents-dropdown";
import db from "@/lib/db";
import { incidentReports, workspaces } from "@/lib/db/schema";
import { monitors } from "@/lib/db/schema/monitors";
import { getIncidentsWithMonitors } from "@/lib/db/utils";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default async function MonitorSingletonLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ workspaceSlug: string; id: string }>;
}) {
	const { workspaceSlug, id } = await params;
	const workspace = await db
		.select()
		.from(workspaces)
		.where(eq(workspaces.slug, workspaceSlug))
		.limit(1)
		.then((res) => {
			return res[0];
		});

	const incident = await getIncidentsWithMonitors(id);

	if (!incident) {
		return notFound();
	}

	const latestReport = await db
		.select()
		.from(incidentReports)
		.where(eq(incidentReports.incidentId, id))
		.orderBy(desc(incidentReports.timestamp))
		.limit(1)
		.then((res) => res[0]);

	const allMonitors = await db
		.select()
		.from(monitors)
		.where(eq(monitors.workspaceId, workspace.id));

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
							{new Date(incident.startedAt).toLocaleString()}
						</p>
					</div>
					<div className="flex flex-row gap-3 items-center">
						{incident.resolvedAt !== null ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button className="opacity-50 cursor-not-allowed">
										<Plus /> Create Report
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>This incident has been resolved.</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<CreateIncidentReport incident={incident} />
						)}
						<IncidentActionsDropdown
							incident={incident}
							monitors={allMonitors}
							variant="outline"
							size="icon"
						/>
					</div>
				</div>
				<div className="container mt-6">{children}</div>
			</div>
		</>
	);
}
