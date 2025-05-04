export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const path = await import('path');
		const { migrate } = await import('drizzle-orm/node-postgres/migrator');
		const { db } = await import('./lib/db/index');
		await migrate(db, { migrationsFolder: path.join(process.cwd(), "lib", "db", "migrations") });
	}
}