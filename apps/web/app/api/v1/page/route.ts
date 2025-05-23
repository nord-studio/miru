import { pageSchema } from "@/app/api/v1/page/schema";
import validateKey from "@/app/api/utils";
import { createStatusPage } from "@/components/status-pages/actions";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Create
export async function POST(request: Request) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { pages: ["create"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const workspace = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.id, key.workspaceId)
	});

	if (!workspace) {
		return NextResponse.json({
			error: true,
			message: "Failed to find workspace for this API key"
		}, {
			status: 500
		});
	}

	let body = null;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({
			error: true,
			message: "Invalid JSON"
		}, {
			status: 400
		});
	}

	const validation = pageSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json({
			error: true,
			message: "Invalid or missing fields",
			fieldErrors: validation.error.flatten().fieldErrors
		}, {
			status: 400
		});
	}

	const { monitorIds, name, root, enabled, domain, design, forcedTheme, brandColor, darkLogo, description, favicon, logo } = validation.data;

	const res = await createStatusPage({
		monitorIds,
		name,
		root,
		enabled,
		domain: domain ?? undefined,
		workspaceId: workspace.id,
		design,
		forcedTheme,
		brandColor: brandColor ?? undefined,
		darkLogo: darkLogo ?? undefined,
		description: description ?? undefined,
		favicon: favicon ?? undefined,
		logo: logo ?? undefined
	});

	if (typeof res?.validationErrors !== "undefined") {
		return NextResponse.json({
			error: true,
			message: Object.keys(res.validationErrors)[0] ? `Invalid ${Object.keys(res.validationErrors)[0]}` : "Invalid fields",
			fieldErrors: res.validationErrors
		});
	}

	if (typeof res?.serverError !== "undefined") {
		return NextResponse.json({
			error: true,
			message: res.serverError
		})
	}

	if (res?.data?.error) {
		return NextResponse.json({
			error: true,
			message: res.data.message
		})
	}

	if (!res?.data?.page) {
		return NextResponse.json({
			error: true,
			message: "Failed to create status page"
		}, {
			status: 500
		});
	}

	return NextResponse.json({
		error: false,
		page: res.data.page
	}, {
		status: 200
	});
}