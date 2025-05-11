import validateKey from "@/app/api/utils";
import { pingMonitor } from "@/components/monitors/actions";
import { NextResponse } from "next/server";

export async function GET(request: Request, {
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const key = await validateKey(request.headers.get('x-api-key'));

	if (!key) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	const { id } = await params;

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