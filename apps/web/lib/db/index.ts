import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "./schema"

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_SSL === "true" ? true : false,
});

export const db = drizzle({
	client: pool,
	schema,
});

export default db;