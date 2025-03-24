"use client"

import SettingsCard from "@/app/admin/[workspaceSlug]/settings/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User } from "@/lib/auth"
import { authClient } from "@/lib/auth/client"
import React from "react"
import { toast } from "sonner"

export default function UserSettings({ user }: { user: User }) {
	const [email, setEmail] = React.useState(user.email);
	const [username, setUsername] = React.useState(user.username);
	const [name, setName] = React.useState(user.name);

	return (
		<>
			<div className="flex flex-col gap-4 w-full">
				<SettingsCard
					title="Name"
					description="Change your full name."
					footer="Your name is purely for display purposes. It is not used for login."
					action={(
						<Button size="sm" onClick={async () => {
							const t = toast.loading("Saving...");

							await authClient.updateUser({
								name
							}).then(({ error }) => {
								if (error) {
									toast.error("Something went wrong!", {
										description: error.message,
										id: t
									});
								} else {
									toast.success("Success!", {
										description: "Your name has been updated.",
										id: t
									})
								}
							})
						}}>
							Save
						</Button>
					)}
				>
					<Input value={name} onChange={(e) => setName(e.target.value)} placeholder={user.name} />
				</SettingsCard>
				<SettingsCard
					title="Email"
					description="Change your email address."
					footer="Your email address is used for login and notifications."
					action={(
						<Button size="sm" onClick={async () => {
							const t = toast.loading("Saving...");

							await authClient.changeEmail({
								newEmail: email,
								callbackURL: "/admin"
							}).then((res) => {
								if (res.error) {
									toast.error("Something went wrong!", {
										description: res.error.message,
										id: t
									});
								} else {
									toast.success("Success!", {
										description: "A confirmation email has been sent to your new email address.",
										id: t
									})
								}
							})
						}}>
							Save
						</Button>
					)}
				>
					<Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={user.email} />
				</SettingsCard>
				<SettingsCard
					title="Username"
					description="Change your username."
					footer="Your username is purely for display purposes. It is not used for login."
					action={(
						<Button size="sm" onClick={async () => {
							const t = toast.loading("Saving...");

							await authClient.updateUser({
								username
							}).then(({ error }) => {
								if (error) {
									toast.error("Something went wrong!", {
										description: error.message,
										id: t
									});
								} else {
									toast.success("Success!", {
										description: "Your username has been updated.",
										id: t
									})
								}
							})
						}}>
							Save
						</Button>
					)}
				>
					<Input value={username!} onChange={(e) => setUsername(e.target.value)} placeholder={user.username!} />
				</SettingsCard>
			</div>
		</>
	)
}