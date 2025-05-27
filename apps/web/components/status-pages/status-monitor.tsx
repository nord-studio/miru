import { StatusMonitorBar } from "@/components/status-pages/monitor-bar";
import db from "@/lib/db";
import { pings } from "@/lib/db/schema";
import { getMonitorUptime } from "@/lib/db/utils";
import { EventWithMonitors } from "@/types/event";
import { IncidentWithReportsAndMonitors } from "@/types/incident";
import { Monitor, StatusDayBlock } from "@/types/monitor";
import { and, eq, sql } from "drizzle-orm";

export default async function StatusPageMonitor({ monitor, incidents, events }: { monitor: Monitor, incidents?: IncidentWithReportsAndMonitors[], events?: EventWithMonitors[] }) {
	const uptime = await getMonitorUptime(monitor.id, 45);

	if (!uptime) {
		return null;
	}

	const days: StatusDayBlock[] = await Promise.all(
		Array.from({ length: 45 }).map(async (_, index) => {
			const date = new Date();
			date.setDate(date.getDate() - index);

			const pingData = await db.query.pings.findMany({
				where: () => and(
					eq(pings.monitorId, monitor.id),
					sql`DATE(${pings.createdAt}) = ${date.toISOString().split("T")[0]}`
				)
			});

			return {
				date,
				totalPings: pingData.length ?? 0,
				failedPings: pingData.filter((ping) => !ping.success).length,
				incidents: incidents?.filter((incident) => {
					return incident.monitors.some((incidMonitor) => {
						return incidMonitor.id === monitor.id && incident.startedAt <= date;
					});
				}) ?? [],
				events: events?.filter((event) => {
					return event.monitors.some((eventMontior) => {
						return eventMontior.id === monitor.id && event.startsAt <= date;
					})
				}) ?? [],
				downtime: 0
			};
		})
	);

	return (
		<>
			<div className="flex flex-col gap-2 items-start w-full" key={monitor.id}>
				<div className="flex flex-row gap-2 items-center justify-between w-full">
					<p className="font-semibold text-lg font-display">
						{monitor.name}
					</p>
					<span className="font-mono text-sm">
						{uptime.uptime_percentage}%
					</span>
				</div>
				<div className="relative w-full h-full">
					<div className="sm:flex flex-row gap-px sm:gap-0.5 hidden">
						{days.toReversed().map((v, i) => {
							return (
								<StatusMonitorBar key={i} data={v} />
							)
						})}
					</div>
					<div className="flex-row gap-px sm:gap-0.5 flex sm:hidden">
						{days.slice(0, 30).toReversed().map((v, i) => {
							return (
								<StatusMonitorBar key={i} data={v} />
							)
						})}
					</div>
				</div>
				<div className="flex flex-row gap-2 items-center justify-between w-full">
					<p className="text-sm before:content-['30'] sm:before:content-['45']">{" "} days ago</p>
					<p className="text-sm">Today</p>
				</div>
			</div>
		</>
	)
}

