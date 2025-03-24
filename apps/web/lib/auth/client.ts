import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"
import { emailOTPClient } from "better-auth/client/plugins"
import { passkeyClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
	baseURL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : `https://${process.env.APP_DOMAIN}`,
	plugins: [
		usernameClient(),
		emailOTPClient(),
		passkeyClient()
	]
});