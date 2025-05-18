"use server";

import { auth } from "@/lib/auth";
import minio, { publicBucketExists } from "@/lib/minio";
import { actionClient } from "@/lib/safe-action";
import { generateId } from "@/lib/utils";
import { flattenValidationErrors } from "next-safe-action";
import { getConfig } from "@/lib/config";
import { headers } from "next/headers";
import { z } from "zod";
import { zfd } from "zod-form-data";

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

	const assetId = id ?? generateId();

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