import { defineConfig } from 'drizzle-kit';
import { config } from "dotenv";

config({ path: "../../.env", quiet: true });

export default defineConfig({
	out: './lib/db/migrations',
	schema: './lib/db/schema',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
		ssl: process.env.DATABASE_SSL === 'true',
	},
	strict: true
});
