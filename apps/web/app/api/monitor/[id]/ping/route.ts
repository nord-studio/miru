import validateKey from "@/app/api/utils";
import { pingMonitor } from "@/components/monitors/actions";
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

	// TODO: @miru/monitor is throwing an error - error returned from database: invalid byte sequence for encoding "UTF8": 0x00
	// Some StackOverflow post I found that might be related: https://stackoverflow.com/questions/1347646/postgres-error-on-insert-error-invalid-byte-sequence-for-encoding-utf8-0x0
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