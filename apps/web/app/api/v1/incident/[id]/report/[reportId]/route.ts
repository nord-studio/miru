import { incidentReportSchema } from "@/app/api/v1/incident/[id]/report/schema";
import validateKey from "@/app/api/utils";
import { deleteIncidentReport, editIncidentReport } from "@/components/incidents/reports/actions";
import db from "@/lib/db";
import { incidentReports, incidents, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Update
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string, reportId: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { incidents: ["update"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id, reportId } = await params;

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

	const report = data.reports.find((report) => report.id === reportId);

	if (!report) {
		return NextResponse.json({
			error: true,
			message: "Incident report not found"
		}, {
			status: 404
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

	const res = await editIncidentReport({
		id: reportId,
		message: validation.data.message,
		status: validation.data.status,
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

// Delete
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, reportId: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { incidents: ["update"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id, reportId } = await params;

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

	const report = data.reports.find((report) => report.id === reportId);

	if (!report) {
		return NextResponse.json({
			error: true,
			message: "Incident report not found"
		}, {
			status: 404
		});
	}

	const res = await deleteIncidentReport({ id: reportId, incidentId: id });

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
		message: "Incident report deleted successfully"
	}, {
		status: 200
	});
}