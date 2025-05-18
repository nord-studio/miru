
import { auth } from "@/lib/auth";
import minio from "@/lib/minio";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
	const res = await auth.api.getSession({
		headers: await headers()
	});

	if (!res || !res.user) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	const data = await request.json();

	if (!data || !data.id) {
		return NextResponse.json({
			error: true,
			message: "No asset ID provided"
		}, {
			status: 400
		});
	}

	await minio.removeObject("public", data.id);

	return NextResponse.json({
		error: false,
		message: "Asset removed successfully"
	}, {
		status: 200
	});
}