"use server"
import { ActionResult } from "@/components/form";
import { monitors } from "@/lib/db/schema/monitors";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { env } from "@/lib/env.mjs";

export async function createMonitor(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
	"use server"
	const name = formData.get("name");
	const type = formData.get("type");
	const url = formData.get("url");
	const interval = formData.get("interval");

	if (!name) {
		return { error: true, message: "Monitor name is required" };
	}

	if (!type) {
		return { error: true, message: "Monitor type is required" };
	}

	if (!url) {
		return { error: true, message: "Monitor URL is required" };
	}

	if (!interval) {
		return { error: true, message: "Monitor interval is required" };
	}

	const id = generateId();

	const monitor = await db.insert(monitors).values({
		id,
		name: name as string,
		type: type as string,
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
	await fetch(`${env.NEXT_PUBLIC_MONITOR_URL}/cron/create/${id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		}
	}).then(async (res) => {
		if (res.status === 200) {
			revalidatePath("/dashboard/monitors");
		} else {
			const json = await res.json();
			if (json.error) {
				revalidatePath("/dashboard/monitors");
				return { error: true, message: json.error };
			} else {
				revalidatePath("/dashboard/monitors");
				return { error: true, message: "Failed to start cron job" };
			}
		}
	}).catch((e) => {
		console.error(e);
		return { error: true, message: "Couldn't reach the monitor service. Is it running?" };
	})

	revalidatePath("/dashboard/monitors");
	return { error: false, message: "Monitor created successfully" };
}

export async function pingMonitor(id: string): Promise<ActionResult> {
	"use server"

	const res = await fetch(`${env.NEXT_PUBLIC_MONITOR_URL}/ping/${id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		}
	}).then(async (res) => {
		if (res.status === 200) {
			revalidatePath("/dashboard/monitors");
			return { error: false, message: "Monitor pinged successfully" };
		} else {
			const json = await res.json();
			if (json.error) {
				revalidatePath("/dashboard/monitors");
				return { error: true, message: json.error };
			} else {
				revalidatePath("/dashboard/monitors");
				return { error: true, message: "Failed to ping monitor" };
			}
		}
	}).catch((e) => {
		console.error(e);
		return { error: true, message: "Couldn't reach the monitor service. Is it running?" };
	})

	return res;
}

export async function editMonitor(id: string, data: FormData): Promise<ActionResult> {
	"use server"
	const mon = await db.select().from(monitors).where(eq(monitors.id, id)).limit(1).then((res) => { return res[0] });

	if (!mon) {
		return { error: true, message: "Monitor not found" };
	}

	const name = data.get("name");
	const type = data.get("type");
	const url = data.get("url");
	const interval = data.get("interval");

	const chunks = [];

	if (name) {
		chunks.push({ name: name });
	}

	if (type) {
		chunks.push({ type: type });
	}

	if (url) {
		chunks.push({ url: url });
	}

	if (interval) {
		chunks.push({ interval: parseInt(interval.toString()) });
	}

	if (chunks.length === 0) {
		return { error: true, message: "No changes detected" };
	}

	const newData = chunks.reduce((acc, chunk) => {
		return { ...acc, ...chunk };
	}, {});

	await db.update(monitors).set(newData).where(eq(monitors.id, id)).then(async () => {
		await fetch(`${env.NEXT_PUBLIC_MONITOR_URL}/cron/update/${id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			}
		}).then(async (res) => {
			if (res.status === 200) {
				revalidatePath("/dashboard/monitors");
			} else {
				const json = await res.json();
				if (json.error) {
					revalidatePath("/dashboard/monitors");
					return { error: true, message: json.error };
				} else {
					revalidatePath("/dashboard/monitors");
					return { error: true, message: "Failed to update cron job" };
				}
			}
		}).catch((e) => {
			console.error(e);
			return { error: true, message: "Couldn't reach the monitor service. Is it running?" };
		})
		revalidatePath("/dashboard/monitors");
	}).catch((err) => {
		return { error: true, message: err };
	});

	revalidatePath("/dashboard/monitors");
	return { error: false, message: "Monitor updated successfully" };
}

export async function deleteMonitor(id: string): Promise<ActionResult> {
	"use server"
	await db.delete(monitors).where(eq(monitors.id, id)).then(async () => {
		await fetch(`${env.NEXT_PUBLIC_MONITOR_URL}/cron/remove/${id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			}
		}).then(async (res) => {
			if (res.status === 200) {
				revalidatePath("/dashboard/monitors");
			} else {
				const json = await res.json();
				if (json.error) {
					revalidatePath("/dashboard/monitors");
					return { error: true, message: json.error };
				} else {
					revalidatePath("/dashboard/monitors");
					return { error: true, message: "Failed to stop cron job" };
				}
			}
		}).catch((e) => {
			console.error(e);
			return { error: true, message: "Couldn't reach the monitor service. Is it running?" }
		})
		revalidatePath("/dashboard/monitors");
	}).catch((err) => {
		console.error(err);
		return { error: true, message: err };
	});

	return { error: false, message: "Monitor deleted successfully" };
}