import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, username } from "better-auth/plugins"
import { passkey } from "better-auth/plugins/passkey"
import sendResetPasswordEmail from "@/lib/email/reset-password";
import sendEmailVerification from "@/lib/email/verify-email";
import db from "../db";

export const auth = betterAuth({
	appName: "miru",
	baseURL: process.env.APP_ENV === "development" ? "http://localhost:3000" : `https://${process.env.APP_DOMAIN}`,
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		requireEmailVerification: process.env.EMAIL_VERIFICATION === "true",
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail(user.email, url)
		}
	},
	user: {
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ newEmail, url }) => {
				await sendEmailVerification(newEmail, url);
			}
		},
		deleteUser: {
			enabled: true,
		}
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmailVerification(user.email, url);
		},
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 3600
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
		username(),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "forget-password") {
					await sendResetPasswordEmail(email, otp);
				}
			},
		}),
		passkey({
			rpID: process.env.APP_ENV === "development" ? "localhost" : process.env.APP_DOMAIN,
			rpName: "Miru",
			origin: process.env.APP_ENV === "development" ? "http://localhost:3000" : `https://${process.env.APP_DOMAIN}`,
		})
	]
});

export type User = typeof auth.$Infer.Session.user;