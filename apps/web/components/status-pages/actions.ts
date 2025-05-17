"use server";

import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import db from "@/lib/db";
import { monitors, workspaces } from "@/lib/db/schema";
import { statusPageMonitors, statusPages } from "@/lib/db/schema/status-pages";
import minio, { publicBucketExists } from "@/lib/minio";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { zfd } from "zod-form-data"

export const createStatusPage = actionClient.schema(z.object({
	id: z.string().optional(),
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

export const uploadAsset = actionClient.schema(zfd.formData({
	// Asset to upload
	file: zfd.file(),
	// Optional id for the asset
	id: z.string().optional(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
	id: z.string().optional(),
})).action(async ({ parsedInput: { file, id } }) => {
	const res = await auth.api.getSession({
		headers: await headers()
	});

	if (!res || !res.user) {
		return { error: true, message: "Unauthorized" };
	}

	if (!file) {
		return { error: true, message: "No file was selected." };
	}

	const { config } = await getConfig();

	if (file.size > config.storage.max_size) {
		return { error: true, message: "Please upload a file smaller than 12MB." };
	}

	const assetId = id || generateId();

	await publicBucketExists();

	await minio.putObject("public", assetId, Buffer.from(await file.arrayBuffer()), file.size, {
		"Content-Type": file.type
	});

	return {
		error: false,
		message: "Asset uploaded successfully",
		id: assetId
	}
});

export const deleteAsset = actionClient.schema(z.object({
	// Asset to delete
	id: z.string(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id } }) => {
	const res = await auth.api.getSession({
		headers: await headers()
	});

	if (!res || !res.user) {
		return { error: true, message: "Unauthorized" };
	}

	await minio.removeObject("public", id);

	return {
		error: false,
		message: "Asset deleted successfully",
	}
});