import validateKey from "@/app/api/utils";
import { testMonitor } from "@/components/monitors/actions";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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

	if (!key) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	const { id } = await params;

	const mon = await db.query.monitors.findFirst({
		where: () => and(eq(monitors.id, id), eq(monitors.workspaceId, key.workspaceId))
	});

	if (!mon) {
		return NextResponse.json({
			error: true,
			message: "Monitor not found"
		}, {
			status: 404
		});
	}

	const res = await testMonitor({
		method: mon.type,
		url: mon.url,
	});

	if (!res) {
		return NextResponse.json({
			error: true,
			message: "Something went wrong requesting the monitoring service. Is it running?"
		}, {
			status: 502
		});
	}

	if (res.data && res.data.error) {
		return NextResponse.json({
			error: true,
			message: res.data.message
		}, {
			status: 500
		});
	}

	return NextResponse.json(res.data, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		}
	});
}