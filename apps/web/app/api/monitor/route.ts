import { monitorSchema } from "@/app/api/monitor/schema";
import validateKey from "@/app/api/utils";
import { pingMonitor } from "@/components/monitors/actions";
import db from "@/lib/db";
import { monitors, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Create
export async function POST(request: Request) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { monitors: ["create"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const body = await request.json();
	const validation = monitorSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(validation.error.flatten(), { status: 400 })
	}

	const workspace = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.id, key.workspaceId)
	});

	if (!workspace) {
		return NextResponse.json({
			error: true,
			message: "Workspace not found"
		}, {
			status: 404
		});
	}

	const { name, type, url, interval } = validation.data;
	const data = await db.insert(monitors).values({
		name,
		type,
		url,
		interval,
		workspaceId: workspace.id
	}).returning().then((res) => res[0]);

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Monitor not found"
		}, {
			status: 404
		});
	}

	await pingMonitor(data.id);

	await fetch(`${process.env.MONITOR_URL}/cron/create/${data.id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		}
	}).then(async (res) => {
		if (res.status !== 200) {
			const json = await res.json();

			if (json.error) {
				return { error: true, message: json.error };
			} else {
				return { error: true, message: "Failed to start cron job" };
			}
		}
	}).catch((e) => {
		console.error(e);
		return { error: true, message: "Couldn't reach the monitor service. Is it running?" };
	})

	return NextResponse.json(data, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		}
	});
}