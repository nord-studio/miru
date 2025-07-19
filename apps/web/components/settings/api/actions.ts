"use server";

import db from "@/lib/db";
import { apikey, workspaces } from "@/lib/db/schema";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache";
import type { ApiKey, ApiKeyPermissions } from "@miru/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCurrentMember } from "@/components/workspace/actions";

export const createApiKey = actionClient.inputSchema(z.object({
	workspaceId: z.string().nonempty(),
	name: z.string().nonempty(),
	expires: z.enum(["7d", "30d", "60d", "90d", "none"]),
	permissions: z.custom<ApiKeyPermissions>(),
	key: z.optional(z.string().length(16)),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
}).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
	key: z.string().nullish()
})).action(async ({ parsedInput: { workspaceId, name, expires, key, permissions } }) => {
	const id = key ?? generateId();

	const workspace = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.id, workspaceId)
	});

	if (!workspace) {
		return {
			error: true,
			message: "The workspace specified doesn't exist."
		}
	};

	let expiresBy: Date | null = new Date();

	switch (expires) {
		case "7d": {
			expiresBy.setDate(expiresBy.getDate() + 7);
			break;
		}
		case "30d": {
			expiresBy.setDate(expiresBy.getDate() + 30);
			break;
		}
		case "60d": {
			expiresBy.setDate(expiresBy.getDate() + 60);
			break;
		}
		case "90d": {
			expiresBy.setDate(expiresBy.getDate() + 90);
			break;
		}
		case "none": {
			expiresBy = null;
			break;
		}
		default: {
			expiresBy.setDate(expiresBy.getDate() + 30);
			break;
		}
	}

	await db.insert(apikey).values({
		id: key,
		name: name,
		workspaceId: workspace.id,
		expiresAt: expiresBy,
		permissions: permissions,
	}).then(() => {
		return {
			error: false,
			message: "Created API key successfully!",
			key: id
		}
	}).catch((err) => {
		console.error(err);
		return {
			error: true,
			message: `Failed to create API key.`
		}
	});

	revalidatePath("/admin/[workspaceSlug/settings/api", "layout");

	return {
		error: false,
		message: "Created API key successfully!",
		key: id
	}
});

export const deleteApiKey = actionClient.inputSchema(z.object({
	id: z.string()
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
}).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id } }) => {
	const data = await auth.api.getSession({
		headers: await headers()
	});

	if (!data || !data.user) {
		return {
			error: true,
			message: "Unauthorized"
		}
	};

	const key = await db.query.apikey.findFirst({
		where: () => eq(apikey.id, id)
	});

	if (!key) {
		return {
			error: true,
			message: "Failed to find API key",
		};
	}

	await db.delete(apikey).where(eq(apikey.id, id)).then(() => {
		return {
			error: false,
			message: "Successfully delete API key.",
		}
	}).catch((err) => {
		console.error(err);
		return {
			error: true,
			message: "Failed to delete API key."
		}
	});

	revalidatePath("/admin/[workspaceSlug]/settings/api", "layout");

	return {
		error: false,
		message: "Successfully delete API key."
	}
})

export const listApiKeys = actionClient.inputSchema(z.object({
	workspaceId: z.string().nonempty(),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
}).outputSchema(z.object({
	error: z.boolean(),
	message: z.string().nullable(),
	data: z.custom<ApiKey[]>().nullish()
})).action(async ({ parsedInput: { workspaceId } }) => {
	const data = await auth.api.getSession({
		headers: await headers()
	});

	if (!data || !data.user) {
		return {
			error: true,
			message: "Unauthorized"
		}
	};

	const workspace = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.id, workspaceId),
	});

	if (!workspace) {
		return {
			error: true,
			message: "Failed to find workspace.",
		}
	}

	const currentMember = await getCurrentMember(workspace.id, data.user.id);

	if (!currentMember) {
		return {
			error: true,
			message: "You are not part of this workspace.",
		}
	};

	const keys = await db.query.apikey.findMany({
		where: () => eq(apikey.workspaceId, workspace.id)
	});

	return {
		error: false,
		message: null,
		data: keys
	}
})