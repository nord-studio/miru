/* eslint-disable @typescript-eslint/no-unused-vars */
import db from "@/lib/db";
import { monitorsToIncidents } from "@/lib/db/schema";
import { IncidentWithMonitor } from "@/types/incident";
import { eq, sql } from "drizzle-orm";

type UptimePercentageRow = {
	monitor_id: string;
	uptime_percentage: number;
};

/// Get a percentage of the uptime
export async function getMonitorUptime(monitorId: string, days: number) {
	const query = sql.raw(`SELECT 
    (COUNT(CASE WHEN success = TRUE THEN 1 END) * 100.0) / COUNT(*)
		AS uptime_percentage FROM pings WHERE monitor_id = '${monitorId}' AND created_at >= NOW() - INTERVAL '${days} days';`);

	const data = await db.execute(query);

	if (data.rows.length === 0) {
		return null;
	}

	return {
		monitor_id: data.rows[0].monitor_id,
		uptime_percentage: parseInt(Number(data.rows[0].uptime_percentage).toFixed(2)),
	};
}

/// Get the percentile latency
async function getMonitorLatency(monitorId: string, percentage: number, days: number) {
	const query = sql.raw(`SELECT 
		percentile_cont(${percentage / 100}) WITHIN GROUP (ORDER BY latency) 
		AS latency FROM pings WHERE monitor_id = '${monitorId}' AND created_at >= NOW() - INTERVAL '${days} days';`);

	const data = await db.execute(query);

	return data.rows.map((row: Record<string, unknown>) => {
		return {
			monitor_id: row.monitor_id,
			latency: parseInt(Number(row.latency).toFixed(2)),
		};
	});
}

/// Get all percentile latencies for all monitors
async function getAllMonitorLatencyPercentiles(days: number) {
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

	const data = await db.execute(query);

	return data.rows.map((row: Record<string, unknown>) => {
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

	const data = await db.execute(query);

	return data.rows.map((row: Record<string, unknown>) => {
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

	const data = await db.execute(query);

	return data.rows.map((row: Record<string, unknown>) => {
		return {
			monitor_id: row.monitor_id as string,
			uptime_percentage: parseInt(Number(row.uptime_percentage).toFixed(2)),
		};
	});
}

/// Get all monitor latency percentiles
async function getAllMonitorLatency(percentage: number, days: number) {
	const query = sql.raw(`SELECT monitor_id, percentile_cont(${percentage / 100}) WITHIN GROUP (ORDER BY latency) 
	AS latency FROM pings WHERE created_at >= NOW() - INTERVAL '${days} days' GROUP BY monitor_id;`);

	const data = await db.execute(query);

	return data.rows.map((row: Record<string, unknown>) => {
		return {
			monitor_id: row.monitor_id,
			latency: parseInt(Number(row.latency).toFixed(2)),
		};
	});
}

/// Get all incidents with the monitors they belong to
async function getAllIncidentsWithMonitors() {
	const data = await db.query.monitorsToIncidents.findMany({
		with: {
			monitor: true,
			incident: true,
		},
	});

	// group together incidents with their monitors as a list
	// oh my god this is so ugly 😭
	const incids = data.reduce((acc: IncidentWithMonitor[], curr) => {
		const found = acc.find((a) => a.id === curr.incident.id);
		if (!found) {
			acc.push({
				...curr.incident,
				monitors: [curr.monitor],
			});
		} else {
			found.monitors.push(curr.monitor);
		}
		return acc;
	}, [] as IncidentWithMonitor[]);

	return incids;
}

/// Get a single incidents with the monitors they belong to
export async function getIncidentsWithMonitors(id: string): Promise<IncidentWithMonitor | null> {
	const data = await db.query.monitorsToIncidents.findMany({
		where: eq(monitorsToIncidents.incidentId, id),
		with: {
			monitor: true,
			incident: true,
		},
	});

	if (!data[0]) {
		return null;
	}

	const incid = {
		...data[0].incident,
		monitors: data.map((d) => d.monitor),
	}

	return incid;
}