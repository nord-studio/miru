import { getAllChannels } from "@/components/notifications/actions";
import { sendDiscordMessage, sendSlackMessage } from "@/components/notifications/utils";
import db from "@/lib/db";
import { incidents, workspaces } from "@/lib/db/schema";
import { actionClient } from "@/lib/safe-action";
import { getAppUrl } from "@/lib/utils";
import { eq, inArray } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import z from "zod";

/// Sends a message to all channels that an incident has been created
export const sendIncidentCreated = actionClient.inputSchema(z.object({
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

				console.log(channel.type)

				const linkedMonitors = monitors.map((m) => {
					if (channel.type === "internal") {
						return `[${m.name} (${m.url})](${appUrl}/admin/${wkrspc.slug}/monitors/${m.id})`
					} else {
						return `[${m.name} (${m.url})](https://${m.url})`
					}
				});

				if (channel.type === "internal") {
					const res = await sendDiscordMessage(channel.url, `## New Incident: [${incident.title}](${appUrl}/admin/${wkrspc.slug}/incidents/${incident.id})\n\nAffected monitors: ${linkedMonitors.join(", ")}\n\nStarted: <t:${Math.floor(incident.startedAt.getTime() / 1000)}:R>\n\n[[View Incident](${appUrl}/admin/${wkrspc.slug}/incidents/${incident.id})]`);
					if (res.error) {
						console.error("Failed to send Discord message: " + res.message);
					}
				} else {
					const spLinks = await db.query.statusPages.findMany({
						with: {
							statusPageMonitors: {
								where: (spm) => inArray(spm.monitorId, monitors.map((m) => m.id)),
							}
						}
					}).then((pages) => {
						return pages.map((page) => {
							if (page.root) {
								return `[${page.name}'s Status Page](${appUrl})`
							} else {
								return `[${page.name}'s Status Page](https://${page.domain})`
							}
						})
					}).catch((err) => {
						console.error("Failed to fetch status pages: " + err);
						return [];
					});

					const res = await sendDiscordMessage(channel.url, `## New Incident: ${incident.title}\n\nAffected monitors: ${linkedMonitors.join(", ")}\n\nStarted: <t:${Math.floor(incident.startedAt.getTime() / 1000)}:R>\n\n[${spLinks.join(" | ")}]`);
					if (res.error) {
						console.error("Failed to send Discord message: " + res.message);
					}
				}
				break;
			}
			case "slack": {
				if (!channel.url) {
					continue;
				}

				const linkedMonitors = monitors.map((m) => {
					if (channel.type === "internal") {
						return `<${appUrl}/admin/${wkrspc.slug}/monitors/${m.id}|${m.name}> (${m.url})`
					} else {
						return `${m.name} (${m.url})`
					}
				})

				if (channel.type === "internal") {
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
				} else {
					const spLinks = await db.query.statusPages.findMany({
						with: {
							statusPageMonitors: {
								where: (spm) => inArray(spm.monitorId, monitors.map((m) => m.id)),
							}
						}
					}).then((pages) => {
						return pages.map((page) => {
							if (page.root) {
								return `<${appUrl}|${page.name}'s Status Page>`
							} else {
								return `<https://${page.domain}|${page.name}'s Status Page>`
							}
						})
					}).catch((err) => {
						console.error("Failed to fetch status pages: " + err);
						return [];
					});

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
									"text": spLinks.join(" | ")
								}
							}
						]
					});

					if (res.error) {
						console.error("Failed to send Slack message: " + res.message);
					}
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