import { monitorSchema } from "@/app/api/monitor/schema";
import validateKey from "@/app/api/utils";
import { deleteMonitor } from "@/components/monitors/actions";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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
		where: () => eq(monitors.id, id)
	});

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Monitor not found"
		}, {
			status: 404
		});
	}

	return NextResponse.json(data, {
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
	const body = await request.json();

	const validation = monitorSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(validation.error.flatten(), { status: 400 })
	}

	const { name, type, url, interval } = validation.data;

	const data = await db.update(monitors).set({
		name,
		type,
		url,
		interval
	}).where(eq(monitors.id, id)).returning().then((res) => res[0]);

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Monitor not found"
		}, {
			status: 404
		});
	}

	return NextResponse.json(data, {
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

