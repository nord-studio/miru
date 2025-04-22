import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import db from "@/lib/db";
import { pings } from "@/lib/db/schema";
import { getMonitorUptime } from "@/lib/db/utils";
import { cn } from "@/lib/utils";
import { Incident, IncidentWithReportsAndMonitors } from "@/types/incident";
import { Monitor } from "@/types/monitor";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { and, eq, sql } from "drizzle-orm";
import { ArrowRight } from "lucide-react";

interface StatusDayBlock {
	date: Date;
	totalPings: number;
	failedPings: number;
	incidents: Incident[];
	downtime: number;
}

export default async function StatusPageMonitor({ monitor, incidents }: { monitor: Monitor, incidents?: IncidentWithReportsAndMonitors[] }) {
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
					return incident.monitorsToIncidents.some((monitorToIncident) => {
						return monitorToIncident.monitor.id === monitor.id && incident.started_at <= date && (incident.resolved_at ? incident.resolved_at >= date : true);
					});
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

const StatusMonitorBarVariants = cva("h-10 rounded-[4px] flex-1", {
	variants: {
		variant: {
			operational: "bg-green-500/80 dark:bg-green-400/80",
			degraded: "bg-yellow-500/80 dark:bg-yellow-400/80",
			down: "bg-red-500/80 dark:bg-red-400/80",
			maintenance: "bg-blue-500/80 dark:bg-blue-400/80",
			empty: "bg-neutral-200 dark:bg-neutral-800"
		}
	},
	defaultVariants: {
		variant: "empty"
	}
});

export function StatusMonitorBar({ data }: { data: StatusDayBlock }) {
	let variant: "operational" | "degraded" | "down" | "maintenance" | "empty" | null | undefined = "operational";
	if (data.totalPings === 0) {
		variant = "empty";
	}

	if (data.incidents.length > 0) {
		variant = "degraded";
	}

	return (
		<>
			<HoverCard
				openDelay={100}
				closeDelay={100}
			>
				<HoverCardTrigger asChild>
					<div
						className={cn(StatusMonitorBarVariants({ variant }))}
					/>
				</HoverCardTrigger>
				<HoverCardContent asChild className="p-0 w-full">
					<div className="flex flex-col gap-1 items-center w-full max-w-[200px]">
						<div className="flex flex-row gap-4 items-center justify-between w-full px-2 pt-2">
							<span className="font-md font-bold text-start">
								{variant === "empty" && "Empty"}
								{variant === "operational" && "Operational"}
								{variant === "degraded" && "Degraded"}
							</span>
							<span className="text-neutral-500 dark:text-neutral-400 text-sm">{format(data.date, "dd MMM")}</span>
						</div>
						<div className={cn("flex flex-row gap-4 items-center justify-between w-full px-2", data.incidents.length <= 0 ? "pb-2" : "pb-1")}>
							<span className="text-sm">
								<span className="text-green-500/80 dark:text-green-400/80">
									{data.totalPings} {" "}
								</span>
								Requests
							</span>
							<span className="text-sm">
								<span className="text-red-500/80 dark:text-red-400/80">
									{data.failedPings} {" "}
								</span>
								Failed
							</span>
						</div>
						<div className="flex flex-row gap-4 items-center justify-between">
							{data.incidents.map((incident) => {
								return (
									<div key={incident.id} className="flex flex-col gap-2 items-center w-full group">
										<hr className="w-full" />
										<button className="flex flex-row gap-2 items-center justify-between w-full hover:cursor-pointer px-2 pb-2" key={incident.id}>
											<span className="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
												{incident.title.slice(0, 20)}{incident.title.length > 20 ? "..." : ""}
											</span>
											<ArrowRight className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
										</button>
									</div>
								)
							})}
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
		</>
	)
}