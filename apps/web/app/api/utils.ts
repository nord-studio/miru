import db from "@/lib/db";
import { apikey } from "@/lib/db/schema";
import { ApiKey } from "@/types/api";
import { eq } from "drizzle-orm";

type Permission = "create" | "read" | "update" | "delete";

type Permissions = {
	monitors?: Permission[];
	incidents?: Permission[];
	pages?: Permission[];
};

function checkPermissions(
	keyPermissions: Permissions,
	required: Permissions
): {
	error: boolean
	message: string
	status: number
} {
	const missing: Record<string, Permission[]> = {};

	for (const category in required) {
		const categoryKey = category as keyof Permissions;
		const requiredPerms = required[categoryKey] ?? [];
		const keyPerms = new Set(keyPermissions[categoryKey] ?? []);
		const missingPerms = requiredPerms.filter((perm) => !keyPerms.has(perm));
		if (missingPerms.length > 0) {
			missing[category] = missingPerms;
		}
	}


	if (Object.keys(missing).length === 0) {
		return {
			error: false,
			message: "All required permissions are granted.",
			status: 200
		};
	}

	const messageLines = Object.entries(missing).map(
		([category, perms]) => `Missing ${category} permissions: ${perms.join(", ")}`
	);

	return {
		error: true,
		message: messageLines.join("; "),
		status: 403
	};
}

export default async function validateKey(key: string | null, requiredPermissions?: Permissions): Promise<{
	error: boolean;
	message: string;
	status: number;
	key: ApiKey | null;
}> {
	if (!key) {
		return {
			error: true,
			message: "API key not found",
			status: 401,
			key: null
		}
	}

	const q = await db.query.apikey.findFirst({
		where: () => eq(apikey.id, key),
	});

	if (!q) {
		return {
			error: true,
			message: "API key not found",
			status: 401,
			key: null
		}
	}

	if (q.expiresAt && q.expiresAt <= new Date()) {
		return {
			error: true,
			message: "API key expired. You can renew it in the dashboard.2",
			status: 401,
			key: null
		}
	}

	if (typeof requiredPermissions !== "undefined") {
		const res = checkPermissions(q.permissions, requiredPermissions);

		if (res.error) {
			return {
				...res,
				key: null,
			}
		}
	}

	return {
		error: false,
		message: "API key is valid",
		status: 200,
		key: q
	}
}