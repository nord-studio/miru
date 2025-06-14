import MonitorGraph from "@/app/admin/[workspaceSlug]/monitors/[id]/graph";
import { StatChip } from "@/components/ui/stat-chip";
import db from "@/lib/db";
import { monitors, pings } from "@/lib/db/schema/monitors";
import {
	getMonitorUptime,
	getSingleMonitorLatencyPercentiles,
} from "@/lib/db/utils";
import { eq, and } from "drizzle-orm";
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
	if (!uptime) {
		return null;
	}

	const percentiles = await getSingleMonitorLatencyPercentiles(id, 7);

	if (!monitor) {
		return notFound();
	}

	let pngs = await db.query.pings.findMany({
		where: and(eq(pings.monitorId, id), eq(pings.success, true)),
		columns: {
			id: true,
			latency: true,
			createdAt: true,
		},
		orderBy: (pings, { asc }) => [asc(pings.createdAt)],
		limit: 100
	});

	// Use pngs to create an array of objects that match { date: "June 10th 12:51pm", latency: 100 }
	const formattedPings = pngs.map((ping) => ({
		date: new Date(ping.createdAt).toLocaleString("en-US", {
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		}),
		latency: ping.latency,
	}));

	return (
		<>
			<div className="grid grid-flow-row grid-cols-6 gap-4">
				<StatChip
					title="Uptime"
					value={uptime.uptime_percentage.toString()}
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
			<MonitorGraph data={formattedPings} />
		</>
	);
}