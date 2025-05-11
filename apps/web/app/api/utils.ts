import db from "@/lib/db";
import { apikey } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function validateKey(key: string | null) {
	if (!key) {
		return null;
	}

	const q = await db.query.apikey.findFirst({
		where: () => eq(apikey.id, key),
	});

	if (!q) {
		return null;
	}

	if (q.expiresAt && q.expiresAt < new Date()) {
		await db.delete(apikey).where(eq(apikey.id, key));
		return null;
	}

	return q;
}