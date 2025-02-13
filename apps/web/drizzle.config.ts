import { defineConfig } from 'drizzle-kit';
import { config } from "dotenv";

config({ path: "../../.env" });

export default defineConfig({
	out: './drizzle',
	schema: ['./lib/db/schema.ts'],
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
