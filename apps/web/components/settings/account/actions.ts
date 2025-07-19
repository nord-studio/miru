"use server"

import { auth } from "@/lib/auth"
import { getConfig } from "@/lib/config"
import db from "@/lib/db"
import { user } from "@/lib/db/schema"
import minio, { publicBucketExists } from "@/lib/minio"
import { deleteAsset } from "@/lib/minio/actions"
import { actionClient } from "@/lib/safe-action"
import { generateId } from "@/lib/utils"
import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { zfd } from "zod-form-data"

export const uploadAvatar = actionClient.inputSchema(zfd.formData({
	file: zfd.file(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
	id: z.string().optional(),
})).action(async ({ parsedInput: { file } }) => {
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

	if (res.user.image) {
		const response = await deleteAsset({ id: res.user.image });
		if (response?.data?.error) {
			console.warn("Failed to delete old avatar", response?.data?.message);
		}
	}

	const assetId = generateId();

	await publicBucketExists();

	await minio.putObject("public", assetId, Buffer.from(await file.arrayBuffer()), file.size, {
		"Content-Type": file.type
	});

	await db.update(user).set({
		image: assetId,
	}).where(eq(user.id, res.user.id)).execute();

	revalidatePath("/admin", "layout");

	return {
		error: false,
		message: "Avatar uploaded successfully",
		id: assetId
	}
})

export const removeAvatar = actionClient.outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async () => {
	const res = await auth.api.getSession({
		headers: await headers()
	});

	if (!res || !res.user) {
		return { error: true, message: "Unauthorized" };
	}

	if (!res.user.image) {
		return { error: true, message: "No avatar to remove." };
	}

	await minio.removeObject("public", res.user.image);

	await db.update(user).set({
		image: null,
	}).where(eq(user.id, res.user.id)).execute();

	revalidatePath("/admin", "layout");

	return {
		error: false,
		message: "Avatar removed successfully",
	}
});