"use server"
import { ActionResult } from "@/components/form";
import { monitors } from "@/lib/db/schema";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

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

	const monitor = await db.insert(monitors).values({
		id: crypto.randomUUID(),
		name: name as string,
		type: type as string,
		url: url as string,
		interval: parseInt(interval?.toString() || "0"),
		createdAt: new Date(),
		updatedAt: new Date(),
		uptime: null,
	}).returning();

	if (!monitor) {
		return { error: true, message: "Failed to create monitor" };
	}

	revalidatePath("/dashboard/monitors");
	return { error: false, message: "Monitor created successfully" };
}

export async function deleteMonitor(id: string): Promise<ActionResult> {
	"use server"
	await db.delete(monitors).where(eq(monitors.id, id)).then(() => {
		revalidatePath("/dashboard/monitors");
	}).catch((err) => {
		return { error: true, message: err };
	});

	return { error: false, message: "Monitor deleted successfully" };
}