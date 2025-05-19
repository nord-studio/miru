"use server";

import { sendIncidentCreated } from "@/components/notifications/actions";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { incidentReports, incidents } from "@/lib/db/schema/incidents";
import { monitors, monitorsToIncidents } from "@/lib/db/schema/monitors";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { IncidentReportStatus } from "@/types/incident-report";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createIncident = actionClient.schema(z.object({
	monitorIds: z.array(z.string()).min(1),
	title: z.string().nonempty(),
	message: z.string().nonempty(),
	status: z.custom<IncidentReportStatus>(async (status) => {
		return Object.values(IncidentReportStatus).includes(status);
	})
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).action(async ({ parsedInput: { monitorIds, title, message, status } }) => {
	const id = generateId();

	const incident = await db.insert(incidents).values({
		id,
		title: title.toString(),
	}).returning();

	for (const id of monitorIds) {
		await db.insert(monitorsToIncidents).values({
			monitorId: id,
			incidentId: incident[0].id,
		})
	}

	const report = await db.insert(incidentReports).values({
		id: generateId(),
		incidentId: incident[0].id,
		message: message.toString(),
		status: status as IncidentReportStatus,
	});

	if (!incident) {
		return { error: true, message: "Failed to create incident" };
	}

	if (!report) {
		return { error: true, message: "Failed to create incident report" };
	}

	const mon = await db.query.monitors.findFirst({
		where: () => eq(monitors.id, monitorIds[0]),
	});

	if (!mon) {
		return { error: true, message: "Failed to find monitor" };
	}

	const wkrspc = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.id, mon.workspaceId),
	});

	if (!wkrspc) {
		return { error: true, message: "Failed to find workspace" };
	}

	await sendIncidentCreated({ workspaceId: wkrspc.id, incidentId: incident[0].id });

	revalidatePath("/admin/[workspaceSlug]/incidents", "layout");
	return { error: false, message: "Incident created successfully" };
});

export const editIncident = actionClient.schema(z.object({
	id: z.string(),
	title: z.string().min(3),
	monitors: z.array(z.string().nonempty()).min(1),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
}).action(async ({ parsedInput: { id, title, monitors: mons } }) => {
	await db.update(incidents).set({
		title: title,
	}).where(eq(incidents.id, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to update incident" };
	});

	const mti = await db.select().from(monitorsToIncidents).where(eq(monitorsToIncidents.incidentId, id));

	// Check if all the monitors are valid
	for (const id of mons) {
		const monitor = await db.query.monitors.findFirst({
			where: () => eq(monitors.id, id),
		});

		if (!monitor) {
			return { error: true, message: "Failed to find monitor with ID: " + id };
		}
	}

	const existingMonitorIds = mti.map((m) => m.monitorId);

	const toRemove = existingMonitorIds.filter((id) => !mons.includes(id));
	const toAdd = mons.filter((id) => !existingMonitorIds.includes(id));

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

	revalidatePath("/admin/[workspaceSlug]/incidents", "layout");
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

	revalidatePath("/admin/[workspaceSlug]/incidents", "layout");
	return { error: false, message: "Incident deleted successfully" };
})