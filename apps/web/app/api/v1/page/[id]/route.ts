import { pageSchema } from "@/app/api/v1/page/schema";
import validateKey from "@/app/api/utils";
import { deleteStatusPages, editStatusPage } from "@/components/status-pages/actions";
import db from "@/lib/db";
import { statusPages, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Read
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { pages: ["read"] });

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

	const { id } = await params;

	const data = await db.query.statusPages.findFirst({
		where: () => eq(statusPages.id, id),
	});

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Page not found"
		}, {
			status: 404
		});
	}

	if (data.workspaceId !== key.workspaceId) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	return NextResponse.json({
		error: false,
		page: data
	}, {
		status: 200
	})
}

// Update
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { pages: ["update"] });

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

	const { id } = await params;

	const data = await db.query.statusPages.findFirst({
		where: () => eq(statusPages.id, id),
	});

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Page not found"
		}, {
			status: 404
		});
	}

	if (data.workspaceId !== key.workspaceId) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
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

	const { design, enabled, forcedTheme, monitorIds, name, root, brandColor, darkLogo, description, domain, favicon, logo } = validation.data;

	const res = await editStatusPage({
		id,
		monitorIds,
		name,
		workspaceId: workspace.id,
		brandColor: brandColor ?? undefined,
		darkLogo: darkLogo ?? undefined,
		description: description ?? undefined,
		domain: domain ?? undefined,
		design,
		forcedTheme,
		enabled,
		favicon: favicon ?? undefined,
		logo: logo ?? undefined,
		root
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

	return NextResponse.json({
		error: false,
		message: "Status page updated successfully."
	}, {
		status: 200
	});
}

// Delete
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { pages: ["delete"] });

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

	const { id } = await params;

	const data = await db.query.statusPages.findFirst({
		where: () => eq(statusPages.id, id),
	});

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Page not found"
		}, {
			status: 404
		});
	}

	if (data.workspaceId !== key.workspaceId) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	const res = await deleteStatusPages([id]);

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

	return NextResponse.json({
		error: false,
		message: "Status page deleted successfully."
	}, {
		status: 200
	});
}