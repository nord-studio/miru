import db from "@/lib/db";
import { sql } from "drizzle-orm";

export type UptimePercentageRow = {
	monitor_id: string;
	uptime_percentage: number;
};

/// Get a percentage of the uptime
export function getMonitorUptime(monitorId: string, days: number) {
	const query = sql.raw(`SELECT 
    (COUNT(CASE WHEN success = TRUE THEN 1 END) * 100.0) / COUNT(*)
		AS uptime_percentage FROM pings WHERE monitor_id = ${monitorId} AND created_at >= NOW() - INTERVAL '${days} days';`);

	return db.execute(query);
}

/// Get the percentile latency
export function getMonitorLatency(monitorId: string, percentage: number, days: number) {
	const query = sql.raw(`SELECT 
		percentile_cont(${percentage}) WITHIN GROUP (ORDER BY latency) 
		AS latency FROM pings WHERE monitor_id = ${monitorId} AND created_at >= NOW() - INTERVAL '${days} days';`);

	return db.execute(query);
}

export async function getAllMonitorUptime(days: number): Promise<UptimePercentageRow[]> {
	const query = sql.raw(`SELECT monitor_id, (COUNT(CASE WHEN success = TRUE THEN 1 END) * 100.0) / COUNT(*) 
	AS uptime_percentage FROM pings WHERE created_at >= NOW() - INTERVAL '${days} days' GROUP BY monitor_id ORDER BY uptime_percentage DESC;`);

	let data = await db.execute(query);

	return data.rows.map((row: any) => {
		return {
			monitor_id: row.monitor_id,
			uptime_percentage: parseInt(Number(row.uptime_percentage).toFixed(2)),
		};
	});
}

/// Get all monitor latency percentiles
export function getAllMonitorLatency(percentage: number, days: number) {
	const query = sql.raw(`SELECT monitor_id, percentile_cont(${percentage}) WITHIN GROUP (ORDER BY latency) 
	AS latency FROM pings WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY monitor_id;`);

	return db.execute(query);
}