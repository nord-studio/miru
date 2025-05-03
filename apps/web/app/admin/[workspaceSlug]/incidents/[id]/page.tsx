import { getIncidentWithReports } from "@/components/incidents/reports/actions";
import IncidentTimelineItem from "@/components/incidents/reports/timeline-item";
import { notFound } from "next/navigation";

export default async function IncidentSingletonPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const raw = await getIncidentWithReports(id);

	if (!raw?.data?.reports || !raw.data.incident) {
		return notFound();
	}

	const reports = raw.data.reports;
	const incident = raw.data.incident;

	return (
		<>
			{reports.length === 0 ? (
				<div className="w-full flex items-center justify-center">
					<p className="text-neutral-500 dark:text-neutral-400">No reports found.</p>
				</div>
			) : (
				<div className="grid gap-4">
					{reports.map((report, i) => (
						<IncidentTimelineItem
							key={report.id}
							editable={true}
							deletable={incident.resolvedAt === null}
							report={report}
							last={i === reports.length - 1}
						/>
					))}
				</div>
			)}
		</>
	);
}
