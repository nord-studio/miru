import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"
import { emailOTPClient } from "better-auth/client/plugins"
import { passkeyClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
	plugins: [
		usernameClient(),
		emailOTPClient(),
		passkeyClient()
	]
});