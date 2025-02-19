import MonitorActionsDropdown from "@/components/monitors/actions-dropdown";
import { EditMonitorButton } from "@/components/monitors/edit-menu";
import { StatChip } from "@/components/ui/stat-chip";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema/monitors";
import {
	getMonitorLatency,
	getMonitorUptime,
	getSingleMonitorLatencyPercentiles,
} from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MonitorSingletonPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	const monitor = await db
		.select()
		.from(monitors)
		.where(eq(monitors.id, id))
		.limit(1)
		.then((res) => res[0]);

	const uptime = await getMonitorUptime(id, 7);
	const percentiles = await getSingleMonitorLatencyPercentiles(id, 7);

	if (!monitor) {
		return notFound();
	}

	return (
		<>
			<div className="w-full flex flex-row gap-2 items-center justify-between">
				<div className="flex flex-col">
					<h1 className="text-3xl font-black font-display">
						{monitor.name}
					</h1>
					<p className="text-neutral-500 dark:text-neutral-400">
						<Link href={`https://${monitor.url}`} target="_blank">
							{monitor.type === "http" && "https://"}
							{monitor.url}
						</Link>{" "}
						• {monitor.type.toUpperCase()} • every{" "}
						{monitor.interval}m
					</p>
				</div>
				<div className="flex flex-row gap-3 items-center">
					<EditMonitorButton monitor={monitor} />
					<MonitorActionsDropdown
						monitor={monitor}
						variant="outline"
						size="icon"
					/>
				</div>
			</div>
			<div className="container mx-auto mt-4">
				<div className="grid grid-flow-row grid-cols-6 gap-4">
					<StatChip
						title="Uptime"
						value={uptime[0].uptime_percentage.toString()}
						measurement="%"
					/>
					<StatChip
						title="P50"
						value={percentiles[0].p50.toString()}
						measurement="ms"
						variant="neutral"
					/>
					<StatChip
						title="P75"
						value={percentiles[0].p75.toString()}
						measurement="ms"
						variant="neutral"
					/>
					<StatChip
						title="P90"
						value={percentiles[0].p90.toString()}
						measurement="ms"
						variant="neutral"
					/>
					<StatChip
						title="P95"
						value={percentiles[0].p95.toString()}
						measurement="ms"
						variant="neutral"
					/>
					<StatChip
						title="P99"
						value={percentiles[0].p99.toString()}
						measurement="ms"
						variant="neutral"
					/>
				</div>
			</div>
		</>
	);
}
