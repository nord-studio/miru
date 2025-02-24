import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../env.mjs';
import { Pool } from 'pg';
import * as schema from "./schema"

const pool = new Pool({
	connectionString: env.DATABASE_URL,
	ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
});

const db = drizzle({
	client: pool,
	schema,
})

export type db = typeof db;

export default db;