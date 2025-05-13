import { monitorSchema, optionalMonitorSchema } from "@/app/api/monitor/schema";
import validateKey from "@/app/api/utils";
import { deleteMonitor } from "@/components/monitors/actions";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Read
export async function GET(request: Request, {
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { monitors: ["read"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id } = await params;

	const data = await db.query.monitors.findFirst({
		where: () => and(eq(monitors.id, id), eq(monitors.workspaceId, key.workspaceId))
	});

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Monitor not found"
		}, {
			status: 404
		});
	}

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

// Update
export async function PATCH(request: Request, {
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { monitors: ["update"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id } = await params;

	if (!request.headers.get('content-type')?.includes('application/json')) {
		return NextResponse.json({
			error: true,
			message: "Invalid content type. Must be application/json"
		}, {
			status: 400
		});
	}

	let body = null;

	try {
		body = await request.json()
	} catch (e) {
		return NextResponse.json({
			error: true,
			message: "Invalid JSON"
		}, {
			status: 400
		});
	}

	const validation = optionalMonitorSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json({
			error: true,
			message: "Invalid or missing fields",
			fieldErrors: validation.error.flatten().fieldErrors
		}, { status: 400 })
	}

	const { name, type, url, interval } = validation.data;

	const monitor = await db.query.monitors.findFirst({
		where: () => and(eq(monitors.id, id), eq(monitors.workspaceId, key.workspaceId))
	});

	if (!monitor) {
		return NextResponse.json({
			error: true,
			message: "Monitor not found"
		}, {
			status: 404
		});
	}

	if (monitor.name === name || monitor.type === type || monitor.url === url || monitor.interval === interval) {
		return NextResponse.json({
			error: true,
			message: "No changes made"
		}, {
			status: 400
		});
	}

	const data = await db.update(monitors).set({
		name: name ?? monitor.name,
		type: type ?? monitor.type,
		url: url ?? monitor.url,
		interval: interval ?? monitor.interval,
		updatedAt: new Date()
	}).where(and(eq(monitors.id, id), eq(monitors.workspaceId, key.workspaceId))).returning().then((res) => res[0]);

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Monitor not found"
		}, {
			status: 404
		});
	}

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

// Delete
export async function DELETE(request: Request, {
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { monitors: ["delete"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id } = await params;

	const monitor = await db.query.monitors.findFirst({
		where: () => and(eq(monitors.id, id), eq(monitors.workspaceId, key.workspaceId))
	});

	if (!monitor) {
		return NextResponse.json({
			error: true,
			message: "Monitor not found"
		}, {
			status: 404
		});
	}

	const res = await deleteMonitor(id);

	if (res?.data?.error) {
		return NextResponse.json({
			error: true,
			message: res.data.message
		}, {
			status: 400
		});
	} else {
		return NextResponse.json({
			error: false,
			message: "Successfully deleted monitor"
		}, {
			status: 200
		});
	}
}

