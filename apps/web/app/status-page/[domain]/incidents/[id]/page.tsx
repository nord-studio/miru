import db from "@/lib/db";
import { incidents } from "@/lib/db/schema";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import SimpleStatusPageShell from "@/designs/simple/shell";
import { IncidentReport, IncidentReportStatus } from "@miru/types";
import StormtrooperStatusPageShell from "@/designs/stormtrooper/shell";
import BackButton from "@/components/back-button";
import IncidentTimelineItem from "@/components/incidents/reports/timeline-item";
import PandaStatusPageShell from "@/designs/panda/shell";
import { cn } from "@/lib/utils";
import Color from "color";

export default async function IncidentSingleton({ params }: { params: Promise<{ domain: string, id: string }> }) {
	const { domain, id } = await params;

	const decodedDomain = decodeURIComponent(domain);

	const statusPage = await db.query.statusPages.findFirst({
		where: sql`(domain = ${decodedDomain} OR (root = true AND domain IS NULL))`,
		orderBy: sql`CASE WHEN domain = ${decodedDomain} THEN 0 ELSE 1 END`,
		with: {
			statusPageMonitors: {
				with: {
					monitor: true
				}
			}
		}
	});

	if (!statusPage || statusPage.enabled === false) {
		return notFound();
	}

	const incident = await db
		.select()
		.from(incidents)
		.where(eq(incidents.id, id))
		.limit(1)
		.then((res) => res[0]);

	if (!incident) {
		return { error: true, message: "Incidents not found" };
	}

	const reports: IncidentReport[] = await db.query.incidentReports.findMany({
		with: {
			incidentId: true
		},
		where: (reports, { eq }) => (eq(reports.incidentId, id)),
		orderBy: (reports, { desc }) => (desc(reports.timestamp)),
	}).then((res) => res.map((r) => ({
		id: r.id,
		incidentId: r.incidentId, // Map incidentId to incident_id
		status: r.status as IncidentReportStatus,
		message: r.message,
		timestamp: r.timestamp,
	})));

	if (!incident) {
		return notFound();
	}

	const latestReport = reports[reports.length - 1];

	const color = Color(statusPage.brandColor || "#5865F2");
	function isLight() {
		if (statusPage!.forcedTheme === "auto") return color.isLight();
		if (statusPage!.forcedTheme === "light") return true;
		if (statusPage!.forcedTheme === "dark") return false;
		else return color.isLight();
	}

	return (
		<>
			{statusPage.design === "simple" && (
				<SimpleStatusPageShell
					page={statusPage}
					header={
						<div className="flex flex-col gap-2 items-start w-full">
							<BackButton />
							<div>
								<h1 className="text-3xl font-black font-display">
									{incident.title}
								</h1>
								<p className="text-neutral-500 dark:text-neutral-400">
									Currently {latestReport.status} • Started at{" "}
									{new Date(incident.startedAt).toLocaleString()}
								</p>
							</div>
						</div>
					}>
					{reports.length === 0 ? (
						<div className="w-full flex items-center justify-center">
							<p className="text-neutral-500 dark:text-neutral-400">No reports found.</p>
						</div>
					) : (
						<div className="grid gap-4">
							{reports.map((report, i) => (
								<IncidentTimelineItem
									key={report.id}
									editable={false}
									report={report}
									last={i === reports.length - 1}
								/>
							))}
						</div>
					)}
				</SimpleStatusPageShell>
			)}
			{statusPage.design === "panda" && (
				<PandaStatusPageShell
					page={statusPage}
					header={
						<div className="flex flex-col gap-2 items-start w-full">
							<BackButton isLight={isLight()} />
							<div>
								<h1 className={cn("text-3xl font-black font-display", isLight() ? "text-neutral-900" : "text-neutral-100")}>
									{incident.title}
								</h1>
								<p className={cn(isLight() ? "text-neutral-900" : "text-neutral-100")}>
									Currently {latestReport.status} • Started at{" "}
									{new Date(incident.startedAt).toLocaleString()}
								</p>
							</div>
						</div>
					}>
					{reports.length === 0 ? (
						<div className="w-full flex items-center justify-center">
							<p className="text-neutral-500 dark:text-neutral-400">No reports found.</p>
						</div>
					) : (
						<div className="grid gap-4">
							{reports.map((report, i) => (
								<IncidentTimelineItem
									key={report.id}
									editable={false}
									report={report}
									last={i === reports.length - 1}
								/>
							))}
						</div>
					)}
				</PandaStatusPageShell>
			)}
			{statusPage.design === "stormtrooper" && (
				<StormtrooperStatusPageShell page={statusPage} header={
					<div className="flex flex-col gap-2 items-start w-full">
						<BackButton />
						<div>
							<h1 className="text-3xl font-black font-display">
								{incident.title}
							</h1>
							<p className="text-neutral-500 dark:text-neutral-400">
								Currently {latestReport.status} • Started at{" "}
								{new Date(incident.startedAt).toLocaleString()}
							</p>
						</div>
					</div>
				}>
					{reports.length === 0 ? (
						<div className="w-full flex items-center justify-center">
							<p className="text-neutral-500 dark:text-neutral-400">No reports found.</p>
						</div>
					) : (
						<div className="grid gap-4">
							{reports.map((report, i) => (
								<IncidentTimelineItem
									key={report.id}
									editable={false}
									report={report}
									last={i === reports.length - 1}
								/>
							))}
						</div>
					)}
				</StormtrooperStatusPageShell>
			)}
		</>
	)
}