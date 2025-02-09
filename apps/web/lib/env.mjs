import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		BETTER_AUTH_SECRET: z.string().min(32),
		DATABASE_URL: z.string(),
	},
	client: {
		NEXT_PUBLIC_URL: z.string().url(),
	},
	runtimeEnv: {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
	},
});
