"use server"

import db from "@/lib/db";
import { pings } from "@/lib/db/schema/monitors";
import { and, desc, eq, gt, sql } from "drizzle-orm";

export async function getMonitorPings({ id, offset = 0, limit = 25, days = 1 }: { id: string; offset?: number; limit?: number, days?: number }) {
	const count = (await db.select().from(pings).where(and(eq(pings.monitorId, id), gt(pings.createdAt, sql.raw(`NOW() - INTERVAL '${days} days'`))))).length;
	const raw = await db
		.select()
		.from(pings)
		.where(and(eq(pings.monitorId, id), gt(pings.createdAt, sql.raw(`NOW() - INTERVAL '${days} days'`))))
		.orderBy(desc(pings.createdAt))
		.limit(limit)
		.offset(offset * limit);

	return {
		data: raw,
		total: count,
	};
}