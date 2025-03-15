import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins"
import db from "../db";
import sendResetPasswordEmail from "@/lib/email/reset-password";

export const auth = betterAuth({
	appName: "miru",
	baseURL: process.env.NEXT_PUBLIC_URL,
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail(user.email, url)
		}
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
		cookiePrefix: "miru",
	},
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: await import("@/lib/db/schema/auth")
	}),
	plugins: [
		nextCookies(),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "forget-password") {
					await sendResetPasswordEmail(email, otp);
				}
			},
		})
	]
})

export type User = typeof auth.$Infer.Session.user;