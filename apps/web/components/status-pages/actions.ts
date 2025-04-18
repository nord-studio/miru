"use server";

import db from "@/lib/db";
import { monitors, workspaces } from "@/lib/db/schema";
import { statusPageMonitors, statusPages } from "@/lib/db/schema/status-pages";
import { actionClient } from "@/lib/safe-action";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createStatusPage = actionClient.schema(z.object({
	workspaceId: z.string(),
	name: z.string(),
	enabled: z.boolean().default(false),
	root: z.boolean().default(false),
	domain: z.string().optional(),
	monitorIds: z.array(z.string()),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { enabled, monitorIds, name, root, workspaceId, domain } }) => {
	const workspace = await db.query.workspaces.findMany({
		where: () => eq(workspaces.id, workspaceId)
	});

	if (!workspace) {
		return { error: true, message: "Workspace not found" };
	}

	if (monitorIds.length === 0) {
		return { error: true, message: "At least one monitor is required" };
	}

	const alreadyRoot = await db.query.statusPages.findFirst({
		where: () => eq(statusPages.root, true)
	});

	if (root && alreadyRoot) {
		return { error: true, message: "There is already a root status page" };
	}

	const statusPage = await db.insert(statusPages).values({
		name: name,
		workspaceId: workspaceId,
		domain: root ? null : domain,
		root: root,
		enabled: enabled,
	}).returning().then((res) => res[0]);

	if (!statusPage) {
		return { error: true, message: "Failed to create status page" };
	}

	let idx = 0;

	monitorIds.forEach(async (id) => {
		// check if monitor exists and belongs to the workspace
		const monitor = await db.query.monitors.findMany({
			where: () => eq(monitors.id, id)
		});

		if (!monitor) {
			return { error: true, message: "Monitor not found" };
		}

		const order = idx++;
		await db.insert(statusPageMonitors).values({
			monitorId: id,
			statusPageId: statusPage.id,
			order
		});
	});

	revalidatePath("/admin/[workspaceSlug]/status-pages", "layout");
	return { error: false, message: "Status page created" };
})

export const editStatusPage = actionClient.schema(z.object({
	id: z.string(),
	workspaceId: z.string(),
	name: z.string(),
	enabled: z.boolean().default(false),
	root: z.boolean().default(false),
	domain: z.string().optional(),
	monitorIds: z.array(z.string()),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id, enabled, monitorIds, name, root, workspaceId, domain } }) => {
	const workspace = await db.query.workspaces.findMany({
		where: () => eq(workspaces.id, workspaceId)
	});

	if (!workspace) {
		return { error: true, message: "Workspace not found" };
	}

	if (monitorIds.length === 0) {
		return { error: true, message: "At least one monitor is required" };
	}

	const statusPage = await db.query.statusPages.findMany({
		with: {
			statusPageMonitors: {
				with: {
					monitor: true,
				}
			}
		},
		where: () => and(eq(statusPages.id, id), eq(statusPages.workspaceId, workspaceId))
	});

	if (!statusPage) {
		return { error: true, message: "Status page not found" };
	}

	const alreadyRoot = await db.query.statusPages.findFirst({
		where: () => eq(statusPages.root, true)
	});

	if (root && alreadyRoot && alreadyRoot.id !== id) {
		return { error: true, message: "There is already a root status page" };
	}

	await db.update(statusPages).set({
		name: name,
		domain: root ? null : domain,
		root: root,
		enabled: enabled,
	}).where(eq(statusPages.id, id)).execute();

	// Delete all monitors and re-add them
	await db.delete(statusPageMonitors).where(eq(statusPageMonitors.statusPageId, id)).execute();

	let idx = 0;

	monitorIds.forEach(async (id) => {
		// check if monitor exists and belongs to the workspace
		const monitor = await db.query.monitors.findMany({
			where: () => eq(monitors.id, id)
		});

		if (!monitor) {
			return { error: true, message: "Monitor not found" };
		}

		const order = idx++;
		await db.insert(statusPageMonitors).values({
			monitorId: id,
			statusPageId: statusPage[0].id,
			order
		});
	});

	revalidatePath("/admin/[workspaceSlug]/status-pages/[id]", "page")
	return { error: false, message: "Status page updated" };
});

export const deleteStatusPage = actionClient.schema(z.object({
	id: z.string(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id } }) => {
	const statusPage = await db.query.statusPages.findMany({
		where: () => and(eq(statusPages.id, id))
	});

	if (!statusPage) {
		return { error: true, message: "Status page not found" };
	}

	// We don't need to delete the monitors as they cascade delete
	await db.delete(statusPages).where(eq(statusPages.id, id)).execute();

	revalidatePath("/admin/[workspaceSlug]/status-pages", "layout");
	return { error: false, message: "Status page deleted" };
});