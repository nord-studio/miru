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

	let body = null;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({
			error: true,
			message: "Invalid JSON"
		}, {
			status: 400
		});
	}

	const validation = monitorSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json({
			error: true,
			message: "Invalid or missing fields",
			fieldErrors: validation.error.flatten().fieldErrors
		}, {
			status: 400
		});
	}

	const workspace = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.id, key.workspaceId)
	});

	if (!workspace) {
		return NextResponse.json({
			error: true,
			message: "Failed to find workspace for this API key"
		}, {
			status: 500
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
			message: "Failed to create monitor"
		}, {
			status: 500
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
				return NextResponse.json({
					error: true,
					message: json.message
				}, {
					status: 502
				});
			} else {
				return NextResponse.json({
					error: true,
					message: "Failed to start cron job"
				}, {
					status: 502
				});
			}
		}
	}).catch((e) => {
		console.error(e);
		return NextResponse.json({
			error: true,
			message: "Failed to start cron job"
		}, {
			status: 502
		});
	})

	return NextResponse.json({
		error: false,
		monitor: data
	}, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		}
	});
}