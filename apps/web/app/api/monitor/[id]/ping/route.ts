import validateKey from "@/app/api/utils";
import { pingMonitor } from "@/components/monitors/actions";
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

	const res = await pingMonitor(id);

	if (res?.data?.error) {
		return NextResponse.json({
			error: true,
			message: res.data.message
		}, {
			status: 500
		});
	}

	return NextResponse.json({
		error: false,
		message: "Monitor pinged successfully"
	}, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		}
	});
}