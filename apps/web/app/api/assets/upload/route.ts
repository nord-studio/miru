import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import minio, { publicBucketExists } from "@/lib/minio";
import { generateId } from "@/lib/utils";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

	const form = await request.formData();
	const file = form.get("file") as File;
	let id = form.get("id") as string | null;

	if (!id) {
		id = generateId();
	}

	if (!file) {
		return NextResponse.json({
			error: true,
			message: "No file was selected"
		}, {
			status: 400
		});
	}

	const { config } = await getConfig();

	if (file.size > config.storage.max_size) {
		return NextResponse.json({
			error: true,
			message: "Please upload a file smaller than 12MB"
		}, {
			status: 400
		});
	}

	await publicBucketExists();

	await minio.putObject("public", id, Buffer.from(await file.arrayBuffer()), file.size, {
		"Content-Type": file.type
	});

	return NextResponse.json({
		error: false,
		message: "Asset uploaded successfully"
	}, {
		status: 200
	});
}