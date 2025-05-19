"use server";

import { sendDiscordMessage, sendSlackMessage } from "@/components/notifications/utils";
import db from "@/lib/db";
import { incidents, monitors, notifications, notificationsToMonitors, workspaces } from "@/lib/db/schema";
import { actionClient } from "@/lib/safe-action";
import { generateId, getAppUrl, isValidUrl } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createChannel = actionClient.schema(z.object({
	name: z.string().nonempty(),
	provider: z.enum(["slack", "discord"]),
	workspaceSlug: z.string().nonempty(),
	monitorIds: z.array(z.string()).min(1),
	url: z.string().optional(),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
}).outputSchema(z.object({
	error: z.boolean(),
	message: z.string()
})).action(async ({ parsedInput: { name, provider, workspaceSlug, url, monitorIds } }) => {
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
			const res = await sendDiscordMessage(url, "This is a test from Miru. If you are reading this, it means the webhook is working! 🎉");

			if (res.error) {
				return {
					error: true,
					message: res.message
				}
			} else {
				return {
					error: false,
					message: "Webhook test successful. Check your Discord channel!"
				}
			}
		}
		case "slack": {
			const res = await sendSlackMessage(url, {
				"blocks": [
					{
						"type": "section",
						"text": {
							"type": "plain_text",
							"text": "This is a test from Miru. If you are reading this, it means the webhook is working! 🎉",
							"emoji": true
						}
					}
				]
			});
			if (res.error) {
				return {
					error: true,
					message: res.message
				}
			} else {
				return {
					error: false,
					message: "Webhook test successful. Check your Slack channel!"
				}
			}
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
	provider: z.enum(["slack", "discord"]),
	url: z.string().optional(),
}), {
	handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
}).action(async ({ parsedInput: { id, monitors: mons, name, provider, url } }) => {
	await db.update(notifications).set({
		name: name,
		provider: provider,
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
});

export const getAllChannels = async (workspaceId: string) => {
	const data = await db.query.notifications.findMany({
		where: () => eq(notifications.workspaceId, workspaceId),
		with: {
			notificationsToMonitors: {
				with: {
					monitor: true
				},
				columns: {}
			}
		}
	});

	const mapped = data.map(({ notificationsToMonitors, ...channel }) => {
		return {
			...channel,
			monitors: notificationsToMonitors.map((m) => m.monitor),
		}
	});

	return mapped;
}

/// Sends a message to all channels that an incident has been created
export const sendIncidentCreated = actionClient.schema(z.object({
	workspaceId: z.string().nonempty(),
	incidentId: z.string().nonempty(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).action(async ({ parsedInput: { workspaceId, incidentId } }) => {
	const wkrspc = await db.query.workspaces.findFirst({
		where: () => eq(workspaces.id, workspaceId)
	});

	if (!wkrspc) {
		return { error: true, message: "Workspace not found" };
	}

	const channels = await getAllChannels(wkrspc.id);

	if (!channels) {
		return { error: true, message: "No channels found" };
	}

	const incident = await db.query.incidents.findFirst({
		where: () => eq(incidents.id, incidentId),
		with: {
			monitorsToIncidents: {
				with: {
					monitor: true
				}
			}
		}
	});

	if (!incident) {
		return { error: true, message: "Incident not found" };
	}

	const monitors = incident.monitorsToIncidents.map((m) => m.monitor);

	const { appUrl } = getAppUrl();

	for (const channel of channels) {
		switch (channel.provider) {
			case "discord": {
				if (!channel.url) {
					continue;
				}

				const linkedMonitors = monitors.map((m) => {
					return `[${m.name} (${m.url})](${appUrl}/admin/${wkrspc.slug}/monitors/${m.id})`
				});

				const res = await sendDiscordMessage(channel.url, `## New Incident: [${incident.title}](${appUrl}/admin/${wkrspc.slug}/incidents/${incident.id})\n\nAffected monitors: ${linkedMonitors.join(", ")}\n\nStarted: <t:${Math.floor(incident.startedAt.getTime() / 1000)}:R>\n\n[[View Incident](${appUrl}/admin/${wkrspc.slug}/incidents/${incident.id})]`);
				if (res.error) {
					console.error("Failed to send Discord message: " + res.message);
				}
				break;
			}
			case "slack": {
				if (!channel.url) {
					continue;
				}

				const linkedMonitors = monitors.map((m) => {
					return `<${appUrl}/admin/${wkrspc.slug}/monitors/${m.id}|${m.name}> (${m.url})`
				})

				const res = await sendSlackMessage(channel.url, {
					"blocks": [
						{
							"type": "header",
							"text": {
								"type": "plain_text",
								"text": `New Incident: ${incident.title}`,
								"emoji": true
							}
						},
						{
							"type": "section",
							"text": {
								"type": "mrkdwn",
								"text": `Affected monitors: ${linkedMonitors.join(", ")}`
							}
						},
						{
							"type": "section",
							"text": {
								"type": "plain_text",
								"text": `Started At: ${incident.startedAt.toLocaleString()}`,
								"emoji": true
							}
						},
						{
							"type": "section",
							"text": {
								"type": "mrkdwn",
								"text": `View the incident <${appUrl}/admin/${wkrspc.slug}/incidents/${incident.id}|here>`
							}
						}
					]
				});

				if (res.error) {
					console.error("Failed to send Slack message: " + res.message);
				}
				break;
			}
			default: {
				console.warn("Invalid provider: " + channel.provider + " for channel: " + channel.id);
				continue;
			}
		}
	}
})