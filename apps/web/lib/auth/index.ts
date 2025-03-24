import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, username } from "better-auth/plugins"
import { passkey } from "better-auth/plugins/passkey"
import sendResetPasswordEmail from "@/lib/email/reset-password";
import db from "../db";
import sendEmailVerification from "@/lib/email/verify-email";

export const auth = betterAuth({
	appName: "miru",
	baseURL: "http://localhost:3000",
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
			rpID: process.env.NODE_ENV === "development" ? "localhost" : global.secrets.domain,
			rpName: "Miru",
			origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : `https://${global.secrets.domain}`,
		})
	]
});

export type User = typeof auth.$Infer.Session.user;