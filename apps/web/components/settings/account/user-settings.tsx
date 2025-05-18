"use client"

import SettingsCard from "@/components/settings/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User } from "@/lib/auth"
import { authClient } from "@/lib/auth/client"
import React from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { removeAvatar, uploadAvatar } from "@/components/settings/account/actions"

export default function UserSettings({ user }: { user: User }) {
	const [loading, setLoading] = React.useState(false);
	const [email, setEmail] = React.useState(user.email);
	const [username, setUsername] = React.useState(user.username);
	const [name, setName] = React.useState(user.name);
	const [avatar, setAvatar] = React.useState(user.image ?? "");
	const avatarInputRef = React.useRef<HTMLInputElement>(null);

	const upload = async (file: FileList | null) => {
		if (!file || file.length === 0) {
			return;
		}

		setLoading(true);
		const t = toast.loading(`Uploading avatar...`);

		const formData = new FormData();
		formData.append("file", file[0]);

		const res = await uploadAvatar(formData);

		if (res?.validationErrors) {
			setLoading(false);
			return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
				description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
				id: t
			});
		}

		if (res?.data?.error) {
			setLoading(false);
			return toast.error("Something went wrong!", {
				description: res.data.message,
				id: t
			});
		}

		if (res?.serverError) {
			setLoading(false);
			return toast.error("Something went wrong!", {
				description: res.serverError,
				id: t
			});
		}

		setLoading(false);
		toast.success("Success!", {
			description: `Uploaded avatar successfully!`,
			id: t
		});

		setAvatar(res?.data?.id ?? "")
	};

	const remove = async () => {
		setLoading(true);

		const t = toast.loading(`Removing avatar...`);

		const res = await removeAvatar();

		if (res?.data?.error) {
			setLoading(false);
			return toast.error("Something went wrong!", {
				description: res.data.message,
				id: t
			});
		}

		if (res?.serverError) {
			setLoading(false);
			return toast.error("Something went wrong!", {
				description: res.serverError,
				id: t
			});
		}

		toast.success("Success!", {
			description: `Removed avatar successfully!`,
			id: t
		});

		setLoading(false);
		setAvatar("");
	};

	return (
		<>
			<div className="flex flex-col w-full gap-4">
				<SettingsCard
					title="Avatar"
					description="Your avatar can viewed by other users. Please be mindful of the image you choose."
					footer="Please use an image that is at least 256x256 pixels."
				>
					<div className="flex flex-row items-center w-full gap-4">
						<Avatar className="size-24">
							<AvatarImage src={`/api/v1/assets/${avatar}`} alt="Avatar" />
							<AvatarFallback className="text-2xl">
								{user.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col items-start gap-2">
							<input
								type="file"
								accept="image/png, image/jpeg, image/webp"
								id="logo"
								className="hidden"
								ref={avatarInputRef}
								onChange={async (e) => {
									await upload(e.target.files);
									if (avatarInputRef.current) {
										avatarInputRef.current.value = ""; // Reset input value
									}
								}}
							/>
							<Button disabled={loading} onClick={() => {
								if (avatarInputRef.current) {
									avatarInputRef.current.click();
								}
							}}>
								Upload
							</Button>
							<Button variant="outline" disabled={loading || !avatar} onClick={async () => await remove()}>
								Remove
							</Button>
						</div>
					</div>
				</SettingsCard>
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