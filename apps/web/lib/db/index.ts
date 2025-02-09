import { drizzle } from 'drizzle-orm/libsql/node';
import { env } from '../env.mjs';

const db = drizzle({
	connection: {
		url: env.DATABASE_URL,
	}
});

export default db;