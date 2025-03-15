import { StatChip } from "@/components/ui/stat-chip";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema/monitors";
import {
	getMonitorUptime,
	getSingleMonitorLatencyPercentiles,
} from "@/lib/db/utils";
import { eq } from "drizzle-orm";
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
		</>
	);
}
