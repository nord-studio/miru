import validateKey from "@/app/api/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'));

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	return NextResponse.json({
		error: false,
		message: "API key is valid",
	}, { status: 200 });
}