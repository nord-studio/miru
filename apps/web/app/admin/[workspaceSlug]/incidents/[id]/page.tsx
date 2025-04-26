import { getIncidentWithReports } from "@/components/incidents/reports/actions";
import IncidentTimelineItem from "@/components/incidents/reports/timeline-item";
import { notFound } from "next/navigation";

export default async function IncidentSingletonPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const reports = await getIncidentWithReports(id);

	if (!reports?.data?.reports) {
		return notFound();
	}

	return (
		<>
			{reports.data.reports.length === 0 ? (
				<div className="w-full flex items-center justify-center">
					<p className="text-neutral-500 dark:text-neutral-400">No reports found.</p>
				</div>
			) : (
				<div className="grid gap-4">
					{reports.data.reports.map((report, i) => (
						<IncidentTimelineItem
							key={report.id}
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
