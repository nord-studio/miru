"use client"

import { Button } from "@/components/ui/button";
import { declineInvite, joinWorkspace } from "@/components/workspace/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function JoinWorkspaceButtons({ inviteToken }: { inviteToken: string }) {
	const router = useRouter();

	return (
		<>
			<div className="flex flex-row gap-3 items-center">
				<Button variant="secondary" onClick={async () => {
					const t = toast.loading("Declining invite...");

					await declineInvite({ inviteToken }).then((res) => {
						if (res?.validationErrors) {
							toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
								description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
								id: t
							});
						}

						if (res?.data?.error) {
							toast.error("Something went wrong!", {
								description: res?.data?.message,
								id: t
							});
						}

						toast.success("Success!", {
							description: res?.data?.message,
							id: t
						});

						return router.push("/admin");
					})
				}}>
					Decline Invite
				</Button>
				<Button onClick={async () => {
					const t = toast.loading("Joining workspace...");

					await joinWorkspace({ inviteToken }).then((res) => {
						if (res?.validationErrors) {
							toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
								description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
								id: t
							});
						}

						if (res?.data?.error) {
							toast.error("Something went wrong!", {
								description: res?.data?.message,
								id: t
							});
						}

						toast.success("Success!", {
							description: res?.data?.message,
							id: t
						});

						return router.push("/admin");
					});
				}}>
					Accept Invite
				</Button>
			</div></>
	)
}