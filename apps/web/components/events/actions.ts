"use server";

import db from "@/lib/db";
import { events, monitors, monitorsToEvents } from "@/lib/db/schema";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { EventWithMonitors } from "@/types/event";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAllEventsWithMonitors(workspaceId: string): Promise<EventWithMonitors[]> {
	let data = await db.query.monitorsToEvents.findMany({
		with: {
			event: true,
			monitor: true
		}
	});

	data = data.filter((d) => d.monitor.workspaceId === workspaceId);

	const events = data.reduce((acc: EventWithMonitors[], curr) => {
		const found = acc.find((a) => a.id === curr.event.id);
		if (!found) {
			acc.push({
				...curr.event,
				monitors: [curr.monitor],
			});
		} else {
			found.monitors.push(curr.monitor);
		}
		return acc;
	}, [] as EventWithMonitors[]);

	return events;
}

export const createEvent = actionClient.schema(z.object({
	title: z.string(),
	message: z.string(),
	monitorIds: z.array(z.string()),
	startsAt: z.date(),
	duration: z.number(),
	autoComplete: z.boolean(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { title, message, monitorIds, startsAt, duration, autoComplete } }) => {
	const id = generateId();

	const event = await db.insert(events).values({
		id,
		title,
		message,
		startsAt,
		duration,
		autoComplete
	}).returning();

	if (!event) {
		return {
			error: true,
			message: "Failed to create event",
		}
	}

	for (const monitorId of monitorIds) {
		await db.insert(monitorsToEvents).values({
			monitorId,
			eventId: event[0].id
		})
	}

	revalidatePath(`/admin/[workspaceSlug]/events`, "layout");

	return {
		error: false,
		message: "Event created successfully",
	}
})

export const editEvent = actionClient.schema(z.object({
	id: z.string(),
	title: z.string().optional(),
	message: z.string().optional(),
	monitorIds: z.array(z.string()),
	startsAt: z.date().optional(),
	duration: z.number().optional(),
	autoComplete: z.boolean().optional(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id, title, message, monitorIds, startsAt, duration, autoComplete } }) => {
	await db.update(events).set({
		title,
		message,
		startsAt,
		duration,
		autoComplete
	}).where(eq(events.id, id)).catch((err) => {
		console.error(err);
		return {
			error: true,
			message: "Failed to update event",
		}
	});

	const mte = await db.select().from(monitorsToEvents).where(eq(monitorsToEvents.eventId, id));

	// Check if all the monitors are valid
	for (const id of monitorIds) {
		const monitor = await db.query.monitors.findFirst({
			where: () => eq(monitors.id, id),
		});

		if (!monitor) {
			return { error: true, message: "Failed to find monitor with ID: " + id };
		}
	}

	const existingMonitorIds = mte.map((m) => m.monitorId);

	const toRemove = existingMonitorIds.filter((id) => !monitorIds.includes(id));
	const toAdd = monitorIds.filter((id) => !existingMonitorIds.includes(id));

	for (const mId of toRemove) {
		await db.delete(monitorsToEvents).where(eq(monitorsToEvents.monitorId, mId)).catch((err) => {
			console.error(err);
			return { error: true, message: "Failed to remove a monitor link" };
		})
	}

	// Add monitors that are not in the existing list
	for (const mId of toAdd) {
		await db.insert(monitorsToEvents).values({
			eventId: id,
			monitorId: mId,
		}).catch((err) => {
			console.error(err);
			return { error: true, message: "Failed to create a monitor link" };
		})
	}

	revalidatePath(`/admin/[workspaceSlug]/events`, "layout");

	return {
		error: false,
		message: "Event created successfully",
	}
})

export const deleteEvent = actionClient.schema(z.object({
	id: z.string()
})).action(async ({ parsedInput: { id } }) => {
	// Delete event
	await db.delete(events).where(eq(events.id, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to delete event" };
	})

	// Delete event relations
	await db.delete(monitorsToEvents).where(eq(monitorsToEvents.eventId, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to delete event" };
	})

	revalidatePath("/admin/[workspaceSlug]/events", "layout");
	return { error: false, message: "Event deleted successfully" };
})