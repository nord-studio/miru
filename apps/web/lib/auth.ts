import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../lib/db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	appName: "Iris",
	baseURL: process.env.NEXT_PUBLIC_URL,
	emailAndPassword: {
		enabled: true,
		autoSignIn: true
	},
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: true,
				unique: true,
				input: true
			},
		}
	},
	session: {
		storeSessionInDatabase: true,
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24
	},
	advanced: {
		cookiePrefix: "iris",
	},
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: await import("@/lib/db/schema/auth")
	}),
	plugins: [nextCookies()]
})

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;