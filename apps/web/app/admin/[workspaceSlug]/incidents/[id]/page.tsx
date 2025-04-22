import { getIncidentWithReports } from "@/components/incidents/reports/actions";
import IncidentTimelineItem from "@/components/incidents/reports/timeline-item";
import { getIncidentsWithMonitors } from "@/lib/db/utils";
import { notFound } from "next/navigation";

export default async function IncidentSingletonPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const incident = await getIncidentsWithMonitors(id);

	if (!incident) {
		return notFound();
	}

	const reports = await getIncidentWithReports(id);

	if (!reports?.data?.reports) {
		return (
			<>
				{/* TODO: Add empty state */}
			</>
		)
	}


	return (
		<>
			{reports.data.reports.length === 0 ? (
				<div className="w-full flex items-center justify-center">
					<p className="text-neutral-500 dark:text-neutral-400">No reports found.</p>
				</div>
			) : (
				<div className="grid gap-4">
					{reports.data.reports.toReversed().map((report, i) => (
						<IncidentTimelineItem
							key={i}
							editable={true}
							report={report}
							last={i === reports.data!.reports!.length - 1}
						/>
					))}
				</div>
			)}
		</>
	);
}
