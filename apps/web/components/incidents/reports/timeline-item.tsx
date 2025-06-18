"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, Check, FingerprintIcon, Search, Trash } from "lucide-react";
import { format } from "date-fns";
import { IncidentReport, IncidentReportStatus } from "@miru/types";
import Alert from "@/components/ui/alert";
import { deleteIncidentReport } from "@/components/incidents/reports/actions";
import { useState } from "react";
import { toast } from "sonner";
import EditIncidentReport from "@/components/incidents/reports/edit-report";

export default function IncidentTimelineItem({
	editable = false,
	deletable = false,
	report,
	last,
}: {
	editable?: boolean;
	deletable?: boolean;
	report: IncidentReport;
	last?: boolean;
}) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const either = editable || deletable;

	return (
		<>
			<div
				className={cn(
					"group -m-2 relative flex gap-4 border border-transparent p-2",
					editable && "hover:rounded-lg hover:border-border hover:shadow hover:bg-muted/80 dark:hover:bg-muted/40",
				)}
			>
				<div className="relative">
					<div className="rounded-full border bg-background p-2">
						{report.status === IncidentReportStatus.IDENTIFIED && (
							<FingerprintIcon className="size-4" />
						)}
						{report.status === IncidentReportStatus.INVESTIGATING && (
							<Search className="size-4" />
						)}
						{report.status === IncidentReportStatus.MONITORING && (
							<Activity className="size-4" />
						)}
						{report.status === IncidentReportStatus.RESOLVED && (
							<Check className="size-4" />
						)}
					</div>
					{!last && (
						<div className="absolute inset-x-0 mx-auto h-full w-[2px] bg-black/10 dark:bg-white/10" />
					)}
				</div>
				<div className="mt-1 grid flex-1">
					<div className={cn("absolute top-2 right-2 hidden gap-2", either && "group-hover:flex group-active:flex")}>
						{editable && (
							<EditIncidentReport report={report} />
						)}
						{deletable && (
							<>
								<Alert
									title="Delete Report"
									description="Are you sure you want to delete this report? This action cannot be undone."
									onSubmit={async () => {
										const t = toast.loading("Deleting report...");
										deleteIncidentReport({
											id: report.id,
											incidentId: report.incidentId,
										}).then((res) => {
											if (res?.data?.error) {
												toast.error("Something went wrong!", {
													description: res.data.message,
													id: t
												})
											} else {
												toast.success("Success!", {
													description: res?.data?.message,
													id: t
												})
											}
										})
									}}
									open={deleteOpen}
									setOpen={setDeleteOpen}
								/>
								<Button size="icon" variant="destructive" onClick={() => setDeleteOpen(true)}>
									<Trash />
								</Button>
							</>
						)}
					</div>
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm">{report.status.slice(0, 1).toUpperCase() + report.status.slice(1)}</p>
						<p className="mt-px text-muted-foreground text-xs">
							<code>
								{format(report.timestamp, "LLL dd, y HH:mm")}
							</code>
						</p>
					</div>
					{/* TODO: Support markdown messages */}
					<p className="max-w-3xl text-sm">{report.message}</p>
				</div>
			</div>
		</>
	)
}