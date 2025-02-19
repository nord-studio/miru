import db from "@/lib/db";
import { sql } from "drizzle-orm";

export type UptimePercentageRow = {
	monitor_id: string;
	uptime_percentage: number;
};

/// Get a percentage of the uptime
export async function getMonitorUptime(monitorId: string, days: number) {
	const query = sql.raw(`SELECT 
    (COUNT(CASE WHEN success = TRUE THEN 1 END) * 100.0) / COUNT(*)
		AS uptime_percentage FROM pings WHERE monitor_id = '${monitorId}' AND created_at >= NOW() - INTERVAL '${days} days';`);

	let data = await db.execute(query);

	return data.rows.map((row: any) => {
		return {
			monitor_id: row.monitor_id,
			uptime_percentage: parseInt(Number(row.uptime_percentage).toFixed(2)),
		};
	});
}

/// Get the percentile latency
export async function getMonitorLatency(monitorId: string, percentage: number, days: number) {
	const query = sql.raw(`SELECT 
		percentile_cont(${percentage / 100}) WITHIN GROUP (ORDER BY latency) 
		AS latency FROM pings WHERE monitor_id = '${monitorId}' AND created_at >= NOW() - INTERVAL '${days} days';`);

	let data = await db.execute(query);

	return data.rows.map((row: any) => {
		return {
			monitor_id: row.monitor_id,
			latency: parseInt(Number(row.latency).toFixed(2)),
		};
	});
}

/// Get all percentile latencies for all monitors
export async function getAllMonitorLatencyPercentiles(days: number) {
	const query = sql.raw(`SELECT 
		monitor_id, 
		percentile_cont(0.5) WITHIN GROUP (ORDER BY latency) AS p50,
		percentile_cont(0.75) WITHIN GROUP (ORDER BY latency) AS p75,
		percentile_cont(0.90) WITHIN GROUP (ORDER BY latency) AS p90,
		percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) AS p95,
		percentile_cont(0.99) WITHIN GROUP (ORDER BY latency) AS p99
	FROM pings 
	WHERE created_at >= NOW() - INTERVAL '${days} days' 
	GROUP BY monitor_id;`);

	let data = await db.execute(query);

	return data.rows.map((row: any) => {
		return {
			monitor_id: row.monitor_id,
			p50: parseInt(Number(row.p50).toFixed(2)),
			p75: parseInt(Number(row.p75).toFixed(2)),
			p90: parseInt(Number(row.p90).toFixed(2)),
			p95: parseInt(Number(row.p95).toFixed(2)),
			p99: parseInt(Number(row.p99).toFixed(2)),
		};
	});
}

/// Get all percentile latencies for a single monitors
export async function getSingleMonitorLatencyPercentiles(monitorId: string, days: number) {
	const query = sql.raw(`SELECT 
		percentile_cont(0.5) WITHIN GROUP (ORDER BY latency) AS p50,
		percentile_cont(0.75) WITHIN GROUP (ORDER BY latency) AS p75,
		percentile_cont(0.90) WITHIN GROUP (ORDER BY latency) AS p90,
		percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) AS p95,
		percentile_cont(0.99) WITHIN GROUP (ORDER BY latency) AS p99
	FROM pings 
	WHERE monitor_id = '${monitorId}' AND created_at >= NOW() - INTERVAL '${days} days';`);

	let data = await db.execute(query);

	return data.rows.map((row: any) => {
		return {
			monitor_id: monitorId,
			p50: parseInt(Number(row.p50).toFixed(2)),
			p75: parseInt(Number(row.p75).toFixed(2)),
			p90: parseInt(Number(row.p90).toFixed(2)),
			p95: parseInt(Number(row.p95).toFixed(2)),
			p99: parseInt(Number(row.p99).toFixed(2)),
		};
	});
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
export async function getAllMonitorLatency(percentage: number, days: number) {
	const query = sql.raw(`SELECT monitor_id, percentile_cont(${percentage / 100}) WITHIN GROUP (ORDER BY latency) 
	AS latency FROM pings WHERE created_at >= NOW() - INTERVAL '${days} days' GROUP BY monitor_id;`);

	let data = await db.execute(query);

	return data.rows.map((row: any) => {
		return {
			monitor_id: row.monitor_id,
			latency: parseInt(Number(row.latency).toFixed(2)),
		};
	});
}