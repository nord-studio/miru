import validateKey from "@/app/api/utils";
import { incidentReportSchema } from "@/app/api/v1/incident/[id]/report/schema";
import { createIncidentReport } from "@/components/incidents/reports/actions";
import db from "@/lib/db";
import { incidents, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Create
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { incidents: ["create"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
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

	const validation = await incidentReportSchema.safeParseAsync(body);

	if (!validation.success) {
		return NextResponse.json({
			error: true,
			message: "Invalid or missing fields",
			fieldErrors: validation.error.flatten().fieldErrors
		}, {
			status: 400
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

	const { message: reportMsg, status: reportStatus } = validation.data;
	const { id } = await params;

	const res = await createIncidentReport({
		incidentId: id,
		message: reportMsg,
		status: reportStatus,
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

	if (res?.data?.report) {
		return NextResponse.json({
			error: false,
			report: res?.data.report
		}, {
			status: 200
		});
	} else {
		return NextResponse.json({
			error: true,
			message: "Failed to create report"
		}, {
			status: 500
		});
	}
}

// Read
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { incidents: ["read"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id } = await params;

	const workspace = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.id, key.workspaceId),
	});

	if (!workspace) {
		return NextResponse.json({
			error: true,
			message: "Failed to find workspace for this API key"
		}, {
			status: 500
		});
	}

	const data = await db.query.incidents.findFirst({
		where: () => eq(incidents.id, id),
		with: {
			reports: true,
			monitorsToIncidents: {
				columns: {
					monitorId: true,
				},
				with: {
					monitor: true
				}
			}
		}
	});

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Incident not found"
		}, {
			status: 404
		});
	}

	if (key.workspaceId !== data.monitorsToIncidents[0].monitor.workspaceId) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	return NextResponse.json({
		error: false,
		reports: data.reports.map(({ ...report }) => report)
	}, {
		status: 200
	});
}