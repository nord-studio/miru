"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { monitors, workspaces } from "@/lib/db/schema";
import { statusPageMonitors, statusPages } from "@/lib/db/schema/status-pages";
import minio, { publicBucketExists } from "@/lib/minio";
import { actionClient } from "@/lib/safe-action";
import { generateId, MAX_FILE_SIZE } from "@/lib/utils";
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
	enabled: z.boolean().default(true),
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

export const uploadLogo = actionClient.schema(zfd.formData({
	// Status page ID
	id: zfd.text(),
	// Logo to upload
	file: zfd.file(),
	// If the logo is used for dark mode
	dark: zfd.text().default("false"),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
	id: z.string().optional(),
})).action(async ({ parsedInput: { file, dark, id } }) => {
	const res = await auth.api.getSession({
		headers: await headers()
	});

	if (!res || !res.user) {
		return { error: true, message: "Unauthorized" };
	}

	if (!file) {
		return { error: true, message: "No file was selected." };
	}

	if (file.size > MAX_FILE_SIZE) {
		return { error: true, message: "Please upload a file smaller than 12MB." };
	}

	const statusPage = await db.query.statusPages.findMany({
		where: () => eq(statusPages.id, id)
	});

	if (!statusPage) {
		return { error: true, message: "Status page not found" };
	}

	const assetId = generateId();

	await publicBucketExists();

	await minio.putObject("public", assetId, Buffer.from(await file.arrayBuffer()), file.size, {
		"Content-Type": file.type
	});

	if (dark === "true") {
		await db.update(statusPages).set({
			darkLogo: assetId,
		}).where(eq(statusPages.id, id)).execute();
	} else {
		await db.update(statusPages).set({
			logo: assetId,
		}).where(eq(statusPages.id, id)).execute();
	}

	return {
		error: false,
		message: "Logo uploaded successfully",
		id: assetId
	}
});

export const removeLogo = actionClient.schema(z.object({
	id: z.string(),
	// If the logo is used for dark mode
	dark: z.boolean().default(false),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id, dark } }) => {
	const res = await auth.api.getSession({
		headers: await headers()
	});

	if (!res || !res.user) {
		return { error: true, message: "Unauthorized" };
	}

	const statusPage = await db.query.statusPages.findMany({
		where: () => eq(statusPages.id, id)
	});

	if (!statusPage) {
		return { error: true, message: "Status page not found" };
	}

	if (dark) {
		await db.update(statusPages).set({
			darkLogo: null,
		}).where(eq(statusPages.id, id)).execute();
	} else {
		await db.update(statusPages).set({
			logo: null,
		}).where(eq(statusPages.id, id)).execute();
	}

	return {
		error: false,
		message: "Logo removed successfully",
	}
});

export const uploadFavicon = actionClient.schema(zfd.formData({
	// Status page ID
	id: zfd.text(),
	// Logo to upload
	file: zfd.file(),
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

	if (file.size > MAX_FILE_SIZE) {
		return { error: true, message: "Please upload a file smaller than 12MB." };
	}

	if (file.type !== "image/vnd.microsoft.icon") {
		return { error: true, message: "Please upload a valid favicon." };
	}

	const statusPage = await db.query.statusPages.findMany({
		where: () => eq(statusPages.id, id)
	});

	if (!statusPage) {
		return { error: true, message: "Status page not found" };
	}

	const assetId = generateId();

	await publicBucketExists();

	await minio.putObject("public", assetId, Buffer.from(await file.arrayBuffer()), file.size, {
		"Content-Type": "image/vnd.microsoft.icon"
	});

	if (!statusPage[0].favicon) {
		await db.update(statusPages).set({
			favicon: assetId,
		}).where(eq(statusPages.id, id)).execute();
	} else {
		await minio.removeObject("public", statusPage[0].favicon);
		await db.update(statusPages).set({
			favicon: assetId,
		}).where(eq(statusPages.id, id)).execute();
	}

	return {
		error: false,
		message: "Favicon uploaded successfully",
		id: assetId
	}
});

export const removeFavicon = actionClient.schema(z.object({
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

	const statusPage = await db.query.statusPages.findMany({
		where: () => eq(statusPages.id, id)
	});

	if (!statusPage) {
		return { error: true, message: "Status page not found" };
	}

	if (!statusPage[0].favicon) {
		return { error: true, message: "Favicon not found" };
	}

	await minio.removeObject("public", statusPage[0].favicon);
	await db.update(statusPages).set({
		favicon: null,
	}).where(eq(statusPages.id, id)).execute();

	return {
		error: false,
		message: "Favicon removed successfully",
	}
});