"use client";

import UpdatePasswordDialog from "@/app/admin/[workspaceSlug]/settings/account/update-password";
import SettingsCard from "@/app/admin/[workspaceSlug]/settings/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import Spinner from "@/components/ui/spinner";
import { User } from "@/lib/auth";
import { authClient } from "@/lib/auth/client";
import { Lock } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function SecurityUserSettings({ user }: { user: User }) {
	const [loading, setLoading] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);
	const { refetch, isPending, isRefetching, data, error } = authClient.useListPasskeys();

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<>
			<div className="flex flex-col gap-4 w-full">
				<SettingsCard
					title="Password"
					description="Update your password to keep your account secure."
					footer="Note: Passwords must be at least 8 characters long.">
					<div className="flex flex-row gap-2">
						<UpdatePasswordDialog user={user}>
							<Button>
								<Lock />
								Update Password
							</Button>
						</UpdatePasswordDialog>
					</div>
				</SettingsCard>
				<SettingsCard
					title="Passkeys"
					description="Passkeys are a safer and easier alternative to passwords."
					footer="Note: Passkeys are not a replacement for your password.">
					<div className="flex flex-row gap-2">
						{mounted ? (
							<>
								{isPending || isRefetching ? (
									<Button disabled>
										<Spinner />
										Loading Passkeys...
									</Button>
								) : (<>
									{error?.message ? (
										<>
											<Button variant="destructive" disabled>
												<Icons.Passkey />
												Failed to load passkeys
											</Button>
										</>
									) : (
										<>
											{data && data.length === 1 ? (
												<Button variant="destructive" onClick={async () => {
													setLoading(true);
													await authClient.passkey.deletePasskey({ id: data[0].id }).then((res) => {
														if (res.error) {
															toast.error("Something went wrong!", {
																description: res.error.message
															});
														} else {
															toast.success("Success!", {
																description: "Passkey deleted successfully."
															});
															refetch();
														}
													}).finally(() => setLoading(false));
												}}>
													<Icons.Passkey />
													Delete Passkey
												</Button>
											) : (
												<Button disabled={loading} onClick={async () => {
													const t = toast.loading("Awaiting browser response...");
													setLoading(true);

													await authClient.passkey.addPasskey().then((res) => {
														if (res?.error) {
															toast.error("Something went wrong!", {
																description: res.error.message,
																id: t
															});
														} else {
															toast.success("Success!", {
																description: "Passkey created successfully.",
																id: t
															});
														}
													}).finally(() => setLoading(false));
												}}>
													<Icons.Passkey />
													Create Passkey
												</Button>
											)}
										</>
									)}
								</>
								)}
							</>
						) : (
							<>
								<Button disabled>
									<Spinner />
									Loading Passkeys...
								</Button>
							</>
						)}
					</div>
				</SettingsCard >
			</div >
		</>
	)
}