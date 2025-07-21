"use server";

import db from "@/lib/db";
import { monitors, workspaces } from "@/lib/db/schema";
import { statusPageMonitors, statusPages } from "@/lib/db/schema/status-pages";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { StatusPage } from "@miru/types";
import { and, eq, inArray } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createStatusPage = actionClient.inputSchema(z.object({
	id: z.string().optional(),
	workspaceId: z.string(),
	name: z.string(),
	enabled: z.boolean().default(true),
	root: z.boolean().default(false),
	domain: z.string().optional(),
	monitorIds: z.array(z.string()).min(1, "At least one monitor is required"),
	description: z.string().optional(),
	logo: z.string().optional(),
	darkLogo: z.string().optional(),
	favicon: z.string().optional(),
	brandColor: z.string().optional(),
	design: z.enum(["simple", "panda", "stormtrooper"]).default("simple"),
	forcedTheme: z.enum(["auto", "light", "dark"]).default("auto"),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
	page: z.custom<StatusPage>().optional(),
})).action(async ({ parsedInput: {
	id,
	monitorIds,
	name,
	root,
	workspaceId,
	enabled,
	domain,
	design,
	forcedTheme,
	brandColor,
	darkLogo,
	description,
	favicon,
	logo
} }) => {
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

	if (!root && !domain) {
		return { error: true, message: "Please provide a domain or enable root" };
	}

	const existing = await db.query.statusPages.findMany({
		where: (statusPages, { eq }) => and(
			eq(statusPages.name, name),
			eq(statusPages.workspaceId, workspaceId)
		)
	});

	if (existing.length > 0) {
		return { error: true, message: "Status page with this name already exists" };
	}

	const statusPage = await db.insert(statusPages).values({
		id: id || generateId(),
		name: name,
		workspaceId: workspaceId,
		domain: root ? null : domain,
		root: root,
		enabled: enabled,
		description: description,
		logo: logo,
		darkLogo: darkLogo,
		favicon: favicon,
		brandColor: brandColor,
		design: design,
		forcedTheme: forcedTheme,
	}).onConflictDoNothing().returning().then((res) => res[0]);

	if (!statusPage) {
		return { error: true, message: "Failed to create status page" };
	}

	let idx = 0;

	monitorIds.forEach(async (id) => {
		// check if monitor exists and belongs to the workspace
		const monitor = await db.query.monitors.findMany({
			where: () => and(eq(monitors.id, id), eq(monitors.workspaceId, workspaceId))
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

	const spm = await db.query.statusPageMonitors.findMany({
		where: () => eq(statusPageMonitors.statusPageId, statusPage.id),
		with: {
			monitor: true,
		}
	});

	revalidatePath("/admin/[workspaceSlug]/status-pages", "layout");
	return {
		error: false, message: "Successfully created status page", page: {
			...statusPage,
			statusPageMonitors: spm.map((spm) => ({
				id: spm.id,
				order: spm.order,
				monitor: spm.monitor
			}))
		}
	};
})

export const editStatusPage = actionClient.inputSchema(z.object({
	id: z.string(),
	workspaceId: z.string(),
	name: z.string(),
	enabled: z.boolean().default(true),
	root: z.boolean().default(false),
	domain: z.string().optional(),
	monitorIds: z.array(z.string()),
	description: z.string().optional(),
	logo: z.string().optional(),
	darkLogo: z.string().optional(),
	favicon: z.string().optional(),
	brandColor: z.string().optional(),
	design: z.enum(["simple", "panda", "stormtrooper"]).default("simple"),
	forcedTheme: z.enum(["auto", "light", "dark"]).default("auto"),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id, enabled, monitorIds, name, root, workspaceId, domain, design, forcedTheme, brandColor, darkLogo, description, favicon, logo } }) => {
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

	if (!root && !domain) {
		return { error: true, message: "Please provide a domain or enable root" };
	}

	await db.update(statusPages).set({
		name: name,
		domain: root ? null : domain,
		root: root,
		enabled: enabled,
		description: description,
		logo: logo,
		darkLogo: darkLogo,
		favicon: favicon,
		brandColor: brandColor,
		design: design,
		forcedTheme
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

export const deleteStatusPages = actionClient.inputSchema(z.array(z.string().nonempty()), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: ids }) => {
	const statusPage = await db.query.statusPages.findMany({
		where: () => and(inArray(statusPages.id, ids))
	});

	if (!statusPage) {
		return { error: true, message: "Status page not found" };
	}

	// We don't need to delete the monitors as they cascade delete
	await db.delete(statusPages).where(inArray(statusPages.id, ids)).execute();

	revalidatePath("/admin/[workspaceSlug]/status-pages", "layout");
	return { error: false, message: "Successfully deleted status page" };
});