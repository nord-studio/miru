import { drizzle } from 'drizzle-orm/libsql/node';
import { env } from '../env.mjs';
import * as schema from './schema';

const db = drizzle({
	connection: {
		url: env.DATABASE_URL,
	},
	schema
});

export default db;