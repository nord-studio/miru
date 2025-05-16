"use server";

import db from "@/lib/db";
import { monitors, notifications, notificationsToMonitors, workspaces } from "@/lib/db/schema";
import { actionClient } from "@/lib/safe-action";
import { generateId, isValidUrl } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createChannel = actionClient.schema(z.object({
	name: z.string().nonempty(),
	provider: z.enum(["email", "slack", "discord"]),
	workspaceSlug: z.string().nonempty(),
	monitorIds: z.array(z.string()).min(1),
	email: z.string().optional(),
	url: z.string().optional(),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
}).outputSchema(z.object({
	error: z.boolean(),
	message: z.string()
})).action(async ({ parsedInput: { name, provider, workspaceSlug, email, url, monitorIds } }) => {
	const id = generateId();

	const workspace = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.slug, workspaceSlug),
	});

	if (!workspace) {
		return { error: true, message: "Workspace not found" };
	}

	const channel = await db.insert(notifications).values({
		id,
		name,
		provider,
		workspaceId: workspace.id,
		email,
		url,
	}).returning().then((res) => res[0]);

	if (!channel) {
		return { error: true, message: "Something went wrong" };
	}

	for (const id of monitorIds) {
		await db.insert(notificationsToMonitors).values({
			notificationId: channel.id,
			monitorId: id
		}).catch((err) => {
			console.log(err);
			return { error: true, message: "Something went wrong" };
		})
	}

	revalidatePath("/admin/[workspaceSlug/]notifications", "layout");
	return { error: false, message: "Channel created successfully" };
})

export async function testWebhook(url: string, provider: "discord" | "slack") {
	"use server";

	// check if url is valid
	if (!url) {
		return {
			error: true,
			message: "URL is required"
		}
	}

	if (!isValidUrl(url)) {
		return {
			error: true,
			message: "URL is not valid"
		}
	}

	switch (provider) {
		case "discord": {
			const res = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					username: "Miru",
					avatar_url: "https://i.imgur.com/CD6oLPo.png",
					content: "This is a test from Miru. If you are reading this, it means the webhook is working! 🎉"
				})
			}).then((res) => {
				if (res.status === 204) {
					return {
						error: false,
						message: "Webhook test successful. Check your Discord channel!"
					}
				} else {
					return {
						error: true,
						message: "Webhook test failed. Is the URL correct?"
					}
				}
			}).catch((err) => {
				console.error(err);
				return { error: true, message: "Webhook test failed. Is the URL correct?" };
			})

			return res;
		}
		case "slack": {
			const res = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					text: "This is a test from Miru. If you are reading this, it means the webhook is working! 🎉"
				})
			}).then((res) => {
				if (res.status === 200) {
					return {
						error: false,
						message: "Webhook test successful. Check your Slack channel!"
					}
				} else {
					return {
						error: true,
						message: "Webhook test failed. Is the URL correct?"
					}
				}
			}).catch((err) => {
				console.error(err);
				return { error: true, message: "Webhook test failed. Is the URL correct?" };
			})
			return res;
		}
		default: {
			return {
				error: true,
				message: "Provider not supported"
			}
		}
	}
}

export const deleteNotification = actionClient.schema(z.object({
	id: z.string()
})).action(async ({ parsedInput: { id } }) => {
	// Delete notification
	await db.delete(notifications).where(eq(notifications.id, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to delete notification" };
	})

	revalidatePath("/admin/[workspaceSlug]/notifications", "layout");
	return { error: false, message: "Notification deleted successfully" };
})

export const editNotification = actionClient.schema(z.object({
	id: z.string(),
	name: z.string().min(3),
	monitors: z.array(z.string().nonempty()).min(1),
	provider: z.enum(["email", "slack", "discord"]),
	email: z.string().optional(),
	url: z.string().optional(),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
}).action(async ({ parsedInput: { id, monitors: mons, name, provider, email, url } }) => {
	await db.update(notifications).set({
		name: name,
		provider: provider,
		email: email,
		url: url,
	}).where(eq(notifications.id, id)).catch((err) => {
		console.error(err);
		return { error: true, message: "Failed to update notification" };
	});

	const mti = await db.select().from(notificationsToMonitors).where(eq(notificationsToMonitors.notificationId, id));

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
		await db.delete(notificationsToMonitors).where(eq(notificationsToMonitors.monitorId, mId)).catch((err) => {
			console.error(err);
			return { error: true, message: "Failed to update notification" };
		})
	}

	// Add monitors that are not in the existing list
	for (const mId of toAdd) {
		await db.insert(notificationsToMonitors).values({
			notificationId: id,
			monitorId: mId,
		}).catch((err) => {
			console.error(err);
			return { error: true, message: "Failed to update notification" };
		})
	}

	revalidatePath("/admin/[workspaceSlug]/notifications", "layout");
	return { error: false, message: "Notification updated successfully" };
})