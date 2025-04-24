"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { editWorkspaceMember } from "@/components/workspace/actions";
import { RankedRoles, WorkspaceMemberWithUser } from "@/types/workspace";
import React from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

export default function ManageMember({ member, currentMember }: { member: WorkspaceMemberWithUser, currentMember: WorkspaceMemberWithUser }) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [mounted, setMounted] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [role, setRole] = React.useState(member.role);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		const t = toast.loading("Updating member...");

		await editWorkspaceMember({
			id: member.id,
			workspaceId: member.workspaceId,
			role,
		}).then((res) => {
			if (res?.validationErrors) {
				return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
					id: t
				});
			}

			if (res?.data?.error) {
				return toast.error("Something went wrong!", {
					description: res.data.message,
					id: t
				});
			}

			toast.success("Member updated", {
				id: t
			});
			setOpen(!open)
		}).finally(() => setLoading(false))
	}

	React.useEffect(() => {
		setMounted(true);
	}, [])

	if (!mounted) {
		return (
			<Button size="sm" disabled>
				Manage
			</Button>
		)
	}

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button size="sm">Manage</Button>
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>Manage {member.user.name}</DialogTitle>
							<DialogDescription>
								Manage the roles and permissions of {member.user.name}.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={onSubmit}>
							<div className="flex flex-col px-6 pb-4 gap-4">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Role</Label>
									<Select
										value={member.role}
										onValueChange={(value) => setRole(value as "member" | "admin" | "owner")}
									>
										<SelectTrigger className="w-full">
											<SelectValue>{role}</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
											{RankedRoles[currentMember.role] >= RankedRoles.owner && (
												<SelectItem value="owner">Owner</SelectItem>
											)}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 p-4 rounded-b-lg">
								<DialogClose asChild>
									<Button
										variant="outline"
										type="button"
									>
										Discard
									</Button>
								</DialogClose>
								<Button disabled={loading} type="submit">
									{loading ? <Spinner /> : "Update"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog >
			</>
		)
	} else {
		return (
			<>
				<Drawer>

				</Drawer>
			</>
		)
	}
}