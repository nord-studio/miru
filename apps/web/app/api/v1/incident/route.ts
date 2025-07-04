import { createIncidentSchema } from "@/app/api/v1/incident/schema";
import validateKey from "@/app/api/utils";
import db from "@/lib/db";
import { incidentReports, incidents, monitors, monitorsToIncidents, workspaces } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { IncidentReportStatus } from "@miru/types";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { incidents: ["read"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const data = await db.query.incidents.findMany({
		with: {
			monitorsToIncidents: {
				columns: {},
				with: {
					monitor: true
				}
			}
		}
	});

	// Filter out the incidents that don't belong to the workspace
	const incidents = data.filter((incident) => {
		if (incident.monitorsToIncidents.length === 0) return false;

		return incident.monitorsToIncidents[0].monitor.workspaceId === key.workspaceId;
	});

	// Pick out the incident data, and remove the monitorsToIncidents from the incident data
	const incidentsToReturn = incidents.map((incident) => {
		const { monitorsToIncidents, ...incidentData } = incident;

		return {
			...incidentData,
			monitors: monitorsToIncidents.map((monitorToIncident) => monitorToIncident.monitor)
		};
	});

	return NextResponse.json({
		error: false,
		incidents: incidentsToReturn
	}, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		}
	});
}

export async function POST(request: Request) {
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

	const validation = await createIncidentSchema.safeParseAsync(body);

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

	const { message: incidMessage, monitorIds, status: incidStatus, title } = validation.data;

	const incident = await db.insert(incidents).values({
		id: generateId(),
		title: title.toString(),
	}).returning();

	if (!incident) {
		return NextResponse.json({
			error: true,
			message: "Failed to create incident"
		}, {
			status: 500
		});
	}

	for (const id of monitorIds) {
		const monitor = await db.query.monitors.findFirst({
			where: () => and(eq(monitors.workspaceId, key.workspaceId), eq(monitors.id, id)),
		});

		if (!monitor) {
			return NextResponse.json({
				error: true,
				message: "Failed to find monitor with ID: " + id
			}, {
				status: 500
			});
		}

		await db.insert(monitorsToIncidents).values({
			monitorId: id,
			incidentId: incident[0].id,
		});
	}

	const report = await db.insert(incidentReports).values({
		id: generateId(),
		incidentId: incident[0].id,
		message: incidMessage.toString(),
		status: incidStatus as IncidentReportStatus,
	}).returning();

	if (!report) {
		return NextResponse.json({
			error: true,
			message: "Failed to create incident report"
		}, {
			status: 500
		});
	}

	return NextResponse.json({
		error: false,
		incident: incident[0],
		report: report[0],
	}, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		}
	});
}