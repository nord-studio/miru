export async function register() {
	if (typeof process.env.MONITOR_URL === "undefined" || process.env.MONITOR_URL === "") {
		throw new Error("The required environment variable MONITOR_URL is not set or is empty.");
	}

	if (typeof process.env.DATABASE_URL === "undefined" || process.env.DATABASE_URL === "") {
		throw new Error("The required environment variable DATABASE_URL is not set or is empty.");
	}

	if (typeof process.env.BETTER_AUTH_SECRET === "undefined" || process.env.BETTER_AUTH_SECRET === "") {
		throw new Error("The required environment variable BETTER_AUTH_SECRET is not set or is empty.");
	}

	if (typeof process.env.APP_DOMAIN === "undefined" || process.env.APP_DOMAIN === "") {
		throw new Error("The required environment variable APP_DOMAIN is not set or is empty.");
	}

	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const path = await import('path');
		const { migrate } = await import('drizzle-orm/node-postgres/migrator');
		const { db } = await import('./lib/db/index');
		await migrate(db, { migrationsFolder: path.join(process.cwd(), "lib", "db", "migrations") });
	}
}