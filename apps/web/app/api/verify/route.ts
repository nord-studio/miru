import validateKey from "@/app/api/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const key = await validateKey(request.headers.get('x-api-key'));

	if (!key) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	return new Response('Authorized', { status: 200 });
}