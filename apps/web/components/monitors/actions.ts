"use server"

import { monitors } from "@/lib/db/schema/monitors";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { workspaces } from "@/lib/db/schema";
import TestEndpoint from "@/types/monitor-service/test";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { flattenValidationErrors } from "next-safe-action";
import { cache } from "react";

export const testMonitor = actionClient.schema(z.object({
	url: z.string().nonempty(),
	method: z.enum(["http", "tcp"])
})).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { method, url } }) => {
	const res = await fetch(`${process.env.MONITOR_URL}/test/${method}/${url}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	}).then(async (res) => {
		const json: TestEndpoint = await res.json();

		if (json.success === true) {
			return { error: false, message: `Connection established with ${url}.` };
		} else {
			return { error: true, message: `Couldn't establish a connection to ${url}.` };
		}
	});

	return res;
});

export const createMonitor = actionClient.schema(z.object({
	name: z.string().nonempty(),
	type: z.enum(["http", "tcp"]),
	url: z.string().nonempty(),
	interval: z.number().int().positive(),
	workspaceSlug: z.string().nonempty(),
}), { handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors }).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { name, type, url, interval, workspaceSlug } }) => {
	const id = generateId();

	const workspace = await db.select().from(workspaces).where(eq(workspaces.slug, workspaceSlug.toString())).limit(1).then((res) => { return res[0] });

	if (!workspace) {
		return { error: true, message: "Workspace not found" };
	}

	const monitor = await db.insert(monitors).values({
		id,
		workspaceId: workspace.id,
		name: name as string,
		type: type as "http" | "tcp",
		url: url as string,
		interval: parseInt(interval?.toString() || "0"),
		createdAt: new Date(),
		updatedAt: new Date(),
	}).returning();

	if (!monitor) {
		return { error: true, message: "Failed to create monitor" };
	}

	// Ping the monitor to get the initial status
	await pingMonitor(id);

	// Start cron job
	await fetch(`${process.env.MONITOR_URL}/cron/create/${id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		}
	}).then(async (res) => {
		if (res.status === 200) {
			revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
		} else {
			const json = await res.json();
			if (json.error) {
				revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
				return { error: true, message: json.error };
			} else {
				revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
				return { error: true, message: "Failed to start cron job" };
			}
		}
	}).catch((e) => {
		console.error(e);
		return { error: true, message: "Couldn't reach the monitor service. Is it running?" };
	})

	revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
	return { error: false, message: "Monitor created successfully" };
});

export const pingMonitor = actionClient.schema(z.string().nonempty()).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: id }) => {
	const res = await fetch(`${process.env.MONITOR_URL}/ping/${id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		}
	}).then(async (res) => {
		if (res.status === 200) {
			revalidatePath("/admin");
			return { error: false, message: "Monitor pinged successfully" };
		} else {
			const json = await res.json();
			if (json.error) {
				revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
				return { error: true, message: json.error };
			} else {
				revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
				return { error: true, message: "Failed to ping monitor" };
			}
		}
	}).catch((e) => {
		console.error(e);
		return { error: true, message: "Couldn't reach the monitor service. Is it running?" };
	})

	return res;
});

export const editMonitor = actionClient.schema(z.object({
	id: z.string().nonempty(),
	data: z.object({
		name: z.string().optional(),
		type: z.enum(["http", "tcp"]).optional(),
		url: z.string().optional(),
		interval: z.number().int().positive().optional(),
	})
})).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: { id, data } }) => {
	const mon = await db.select().from(monitors).where(eq(monitors.id, id)).limit(1).then((res) => { return res[0] });

	if (!mon) {
		return { error: true, message: "Monitor not found" };
	}

	const chunks = [];

	if (data.name) {
		chunks.push({ name: data.name });
	}

	if (data.type) {
		chunks.push({ type: data.type });
	}

	if (data.url) {
		chunks.push({ url: data.url });
	}

	if (data.interval) {
		chunks.push({ interval: parseInt(data.interval.toString()) });
	}

	if (chunks.length === 0) {
		return { error: true, message: "No changes detected" };
	}

	const newData: { name?: string; type?: "http" | "tcp"; url?: string; interval?: number } = chunks.reduce((acc, chunk) => {
		return { ...acc, ...chunk };
	}, {});

	await db.update(monitors).set(newData).where(eq(monitors.id, id)).then(async () => {
		if (newData.interval || newData.url || newData.type) {
			await fetch(`${process.env.MONITOR_URL}/cron/update/${id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				}
			}).then(async (res) => {
				if (res.status === 200) {
					revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
				} else {
					const json = await res.json();
					if (json.error) {
						revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
						return { error: true, message: json.error };
					} else {
						revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
						return { error: true, message: "Failed to update cron job" };
					}
				}
			}).catch((e) => {
				console.error(e);
				return { error: true, message: "Couldn't reach the monitor service. Is it running?" };
			})
		}
		revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
	}).catch((err) => {
		return { error: true, message: err };
	});

	revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
	return { error: false, message: "Monitor updated successfully" };
});

export const deleteMonitor = actionClient.schema(z.string().nonempty()).outputSchema(z.object({
	error: z.boolean(),
	message: z.string(),
})).action(async ({ parsedInput: id }) => {
	await db.delete(monitors).where(eq(monitors.id, id)).then(async () => {
		await fetch(`${process.env.MONITOR_URL}/cron/remove/${id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			}
		}).then(async (res) => {
			if (res.status === 200) {
				revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
			} else {
				const json = await res.json();
				if (json.error) {
					revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
					return { error: true, message: json.error };
				} else {
					revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
					return { error: true, message: "Failed to stop cron job" };
				}
			}
		}).catch((e) => {
			console.error(e);
			return { error: true, message: "Couldn't reach the monitor service. Is it running?" }
		})
		revalidatePath("/admin/[workspaceSlug]/monitors", "layout");
	}).catch((err) => {
		console.error(err);
		return { error: true, message: err };
	});

	return { error: false, message: "Monitor deleted successfully" };
});

export const getAllMonitors = cache(actionClient.action(async () => {
	const mons = await db.select().from(monitors);
	return mons;
}))