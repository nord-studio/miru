import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../env.mjs';
import { Pool } from 'pg';

const pool = new Pool({
	connectionString: env.DATABASE_URL,
	ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const db = drizzle({
	client: pool,
});

export default db;