import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		BETTER_AUTH_SECRET: z.string().min(32),
		DATABASE_URL: z.string().url(),
		DATABASE_SSL: z
			.enum(["true", "false"])
			.transform((v) => v === "true")
			.default("false")
			.optional(),
		// Configuration
		ENABLE_EMAIL: z
			.enum(["true", "false"])
			.transform((v) => v === "true")
			.default("true")
			.optional(),
		// Email Config
		SMTP_HOST: z.string().optional(),
		SMTP_SECURE: z
			.enum(["true", "false"])
			.transform((v) => v === "true")
			.default("true")
			.optional(),
		SMTP_PORT: z
			.union([z.string(), z.number()])
			.transform((x) => Number(x))
			.pipe(z.number())
			.optional(),
		SMTP_USER: z.string().optional(),
		SMTP_PASSWORD: z.string().optional(),
		SMTP_FROM: z.string().optional(),
	},
	client: {
		NEXT_PUBLIC_URL: z.string().url(),
		NEXT_PUBLIC_MONITOR_URL: z.string().url(),
	},
	runtimeEnv: {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		DATABASE_SSL: process.env.DATABASE_SSL,
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
		NEXT_PUBLIC_MONITOR_URL: process.env.NEXT_PUBLIC_MONITOR_URL,
		ENABLE_EMAIL: process.env.ENABLE_EMAIL,
		SMTP_HOST: process.env.SMTP_HOST,
		SMTP_SECURE: process.env.SMTP_SECURE,
		SMTP_PORT: process.env.SMTP_PORT,
		SMTP_USER: process.env.SMTP_USER,
		SMTP_PASSWORD: process.env.SMTP_PASSWORD,
		SMTP_FROM: process.env.SMTP_FROM,
	},
});
