import { incidentSchema } from "@/app/api/v1/incident/schema";
import validateKey from "@/app/api/utils";
import { editIncident } from "@/components/incidents/actions";
import db from "@/lib/db";
import { incidents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Read
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { monitors: ["create"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id } = await params;

	const data = await db.query.incidents.findFirst({
		with: {
			monitorsToIncidents: {
				columns: {},
				with: {
					monitor: true
				}
			}
		},
		where: () => eq(incidents.id, id)
	});

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Incident not found"
		}, {
			status: 404
		});
	}

	// We can check the first monitorToIncident to see if the incident belongs to the workspace
	if (key.workspaceId !== data.monitorsToIncidents[0].monitor.workspaceId) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	// Pick out the incident data, and remove the monitorsToIncidents from the incident data
	const { monitorsToIncidents, ...incidentData } = data;

	return NextResponse.json({
		error: false,
		incident: {
			...incidentData,
			monitors: monitorsToIncidents.map((monitorToIncident) => monitorToIncident.monitor)
		}
	}, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		}
	});
}

// Update
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { monitors: ["create"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id } = await params;

	if (!request.headers.get('content-type')?.includes('application/json')) {
		return NextResponse.json({
			error: true,
			message: "Invalid content type. Must be application/json"
		}, {
			status: 400
		});
	}

	let body = null;

	try {
		body = await request.json();
	} catch (e) {
		return NextResponse.json({
			error: true,
			message: "Invalid JSON: " + e
		}, {
			status: 400
		});
	}

	const validation = incidentSchema.partial().safeParse(body);

	if (!validation.success) {
		return NextResponse.json({
			error: true,
			message: "Invalid or missing fields",
			fieldErrors: validation.error.flatten().fieldErrors
		}, { status: 400 })
	}

	const { monitorIds, title } = validation.data;

	if (!monitorIds || monitorIds[0] === "") {
		return NextResponse.json({
			error: true,
			message: "Invalid or missing fields",
			fieldErrors: {
				monitorIds: ["At least 1 monitor ID is required"]
			}
		}, { status: 400 })
	}

	const incident = await db.query.incidents.findFirst({
		with: {
			monitorsToIncidents: {
				columns: {
					monitorId: true,
				},
				with: {
					monitor: true
				}
			}
		},
		where: () => eq(incidents.id, id)
	});

	if (!incident) {
		return NextResponse.json({
			error: true,
			message: "Incident not found"
		}, {
			status: 404
		});
	}

	// We can check the first monitorToIncident to see if the incident belongs to the workspace
	if (key.workspaceId !== incident.monitorsToIncidents[0].monitor.workspaceId) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	const res = await editIncident({
		id: incident.id,
		title: title ?? incident.title,
		monitors: monitorIds ?? incident.monitorsToIncidents.map((monitorToIncident) => monitorToIncident.monitorId)
	});

	if (res && res.validationErrors && typeof res?.validationErrors !== "undefined") {
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

	const data = await db.query.incidents.findFirst({
		with: {
			monitorsToIncidents: {
				columns: {},
				with: {
					monitor: true
				}
			}
		},
		where: () => eq(incidents.id, id)
	});

	if (!data) {
		return NextResponse.json({
			error: true,
			message: "Incident not found"
		}, {
			status: 404
		});
	}

	const { monitorsToIncidents, ...incidentData } = data;

	return NextResponse.json({
		error: false,
		incident: {
			...incidentData,
			monitors: monitorsToIncidents.map((monitorToIncident) => monitorToIncident.monitor)
		}
	}, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		}
	});
}

// Delete
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { key, error, message, status } = await validateKey(request.headers.get('x-api-key'), { monitors: ["delete"] });

	if (error || !key) {
		return NextResponse.json({
			error: true,
			message: message ?? "Unauthorized",
		}, {
			status: status ?? 401
		});
	}

	const { id } = await params;

	const incident = await db.query.incidents.findFirst({
		with: {
			monitorsToIncidents: {
				columns: {
					monitorId: true,
				},
				with: {
					monitor: true
				}
			}
		},
		where: () => eq(incidents.id, id)
	});

	if (!incident) {
		return NextResponse.json({
			error: true,
			message: "Incident not found"
		}, {
			status: 404
		});
	}

	if (key.workspaceId !== incident.monitorsToIncidents[0].monitor.workspaceId) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	await db.delete(incidents).where(eq(incidents.id, id));

	return NextResponse.json({
		error: false,
		message: "Incident deleted successfully"
	}, {
		status: 200
	});
}
