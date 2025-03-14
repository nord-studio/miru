"use server";

import db from "@/lib/db";
import { incidentReports, incidents } from "@/lib/db/schema/incidents";
import { monitorsToIncidents } from "@/lib/db/schema/monitors";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { ActionResult } from "@/types/form";
import { IncidentStatus } from "@/types/incident";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createIncident(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
	"use server";
	// Incident data
	const id = generateId();
	const monitorIds = formData.getAll("monitorIds") as string[];
	const title = formData.get("title");

	// Incident Report data
	const message = formData.get("message");
	const status = formData.get("status");

	// Validate form data
	if (!title) {
		return { error: true, message: "Incident title is required" };
	}

	if (!message) {
		return { error: true, message: "Incident message is required" };
	}

	if (!status) {
		return { error: true, message: "Incident status is required" };
	}

	// check if status equals any of the enums
	if (!Object.values(IncidentStatus).includes(status as IncidentStatus)) {
		return { error: true, message: "Invalid incident status" };
	}

	// Create incident
	const incident = await db.insert(incidents).values({
		id,
		title: title.toString(),
	}).returning();

	// Create relations between monitors and incidents
	for (const id of monitorIds) {
		await db.insert(monitorsToIncidents).values({
			monitorId: id,
			incidentId: incident[0].id,
		})
	}

	// Create incident report
	const report = await db.insert(incidentReports).values({
		id: generateId(),
		incidentId: incident[0].id,
		message: message.toString(),
		status: status as IncidentStatus,
	});

	if (!incident) {
		return { error: true, message: "Failed to create incident" };
	}

	if (!report) {
		return { error: true, message: "Failed to create incident report" };
	}

	revalidatePath("/dashboard/incidents");
	return { error: false, message: "Incident created successfully" };
}

export const editIncident = actionClient.schema(z.object({
	id: z.string(),
	data: z.object({
		title: z.string().min(3),
		monitors: z.array(z.string()),
	})
})).action(async ({ parsedInput: { id, data } }) => {
	await db.update(incidents).set({
		title: data.title,
	}).where(eq(incidents.id, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to update incident" };
	})

	const mti = await db.select().from(monitorsToIncidents).where(eq(monitorsToIncidents.incidentId, id))

	// Either remove or create new records in the join table based on the new monitor list
	const monitorIds = data.monitors;
	const existingMonitorIds = mti.map((m) => m.monitorId);

	const toRemove = existingMonitorIds.filter((id) => !monitorIds.includes(id));
	const toAdd = monitorIds.filter((id) => !existingMonitorIds.includes(id));

	// Remove monitors that are not in the new list
	for (const mId of toRemove) {
		await db.delete(monitorsToIncidents).where(eq(monitorsToIncidents.monitorId, mId)).catch((err) => {
			console.error(err);
			return { error: true, message: "Failed to update incident" };
		})
	}

	// Add monitors that are not in the existing list
	for (const mId of toAdd) {
		await db.insert(monitorsToIncidents).values({
			incidentId: id,
			monitorId: mId,
		}).catch((err) => {
			console.error(err);
			return { error: true, message: "Failed to update incident" };
		})
	}

	revalidatePath("/dashboard/incidents");
	return { error: false, message: "Incident edited successfully" };
})

export const deleteIncident = actionClient.schema(z.object({
	id: z.string()
})).action(async ({ parsedInput: { id } }) => {
	// Delete incident
	await db.delete(incidents).where(eq(incidents.id, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to delete incident" };
	})

	// Delete incident relations
	await db.delete(monitorsToIncidents).where(eq(monitorsToIncidents.incidentId, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to delete incident" };
	})

	// Delete incident reports
	await db.delete(incidentReports).where(eq(incidentReports.incidentId, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to delete incident" };
	})

	revalidatePath("/dashboard/incidents");
	return { error: false, message: "Incident deleted successfully" };
})