import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import db from "@/lib/db";
import { getAppUrl } from "@/lib/utils";
import { getConfig } from "@/lib/config";
import sendResetPasswordEmail, { sendEmailVerification } from "@/components/auth/actions";

const { appDomain, appUrl } = getAppUrl();
const { config } = await getConfig();

export const auth = betterAuth({
  appName: "miru",
  baseURL: appUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: config.email.verification,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }) => {
        await sendEmailVerification(newEmail, url);
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerification(user.email, url);
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  },
  session: {
    storeSessionInDatabase: true,
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    cookiePrefix: "miru",
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: await import("@/lib/db/schema"),
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
      rpID: appDomain,
      rpName: "Miru",
      origin: appUrl,
    }),
  ],
});

export type User = typeof auth.$Infer.Session.user;
