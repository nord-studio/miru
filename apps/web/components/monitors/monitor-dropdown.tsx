"use client";

import Link from "next/link";
import { MoreHorizontal, Trash } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { pingMonitor } from "@/components/monitors/actions";
import React from "react";
import EditMonitor from "@/components/monitors/edit-monitor";
import DeleteMonitor from "@/components/monitors/delete-monitor";
import { Monitor } from "@/types/monitor";
import { testUrl } from "@/components/monitors/utils";
import { VariantProps } from "class-variance-authority";
import { usePathname } from "next/navigation";
import { RankedRoles, WorkspaceMemberWithUser } from "@/types/workspace";
import { getCurrentMember } from "@/components/workspace/actions";
import Spinner from "@/components/ui/spinner";

export default function MonitorActionsDropdown({
	monitor,
	workspaceId,
	...props
}: {
	monitor: Monitor;
	workspaceId: string;
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>) {
	const pathname = usePathname();
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [currentMember, setCurrentMember] = React.useState<WorkspaceMemberWithUser | null>(null);

	React.useEffect(() => {
		getCurrentMember(workspaceId).then((res) => {
			setCurrentMember(res
			);
		});
	}, [workspaceId]);

	if (!currentMember) {
		return (
			<div className="w-full flex-row flex justify-end">
				<Button variant="ghost" {...props}>
					<span className="sr-only">Open menu</span>
					<Spinner size={16} />
				</Button>
			</div>
		);
	}

	return (
		<>
			<div className="w-full flex-row flex justify-end">
				{RankedRoles[currentMember.role] >= RankedRoles.admin && (
					<>
						<DeleteMonitor
							open={deleteOpen}
							setOpen={setDeleteOpen}
							id={monitor.id}
						/>
						<EditMonitor
							monitor={monitor}
							open={editOpen}
							setOpen={setEditOpen}
						/>
					</>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild className="">
						<Button variant="ghost" {...props}>
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						{RankedRoles[currentMember.role] >= RankedRoles.admin && (
							<DropdownMenuItem onClick={() => setEditOpen(true)}>
								Edit
							</DropdownMenuItem>
						)}
						<Link
							href={`/admin/${pathname.split("/")[2]}/monitors/${monitor.id
								}`}
						>
							<DropdownMenuItem>Details</DropdownMenuItem>
						</Link>
						<DropdownMenuItem
							onClick={() =>
								toast.promise(
									testUrl(monitor.type, monitor.url),
									{
										loading: `Test Pinging ${monitor.url}`,
										success: `Connection established to ${monitor.url}!`,
										error: `Failed to ping ${monitor.url}. Is the domain correct?`,
									}
								)
							}
						>
							Test
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={async () => {
								const t = toast.loading(
									`Pinging ${monitor.url}...`
								);

								await pingMonitor(monitor.id).then((res) => {
									if (res?.data?.error) {
										toast.error("Something went wrong!", {
											description: res.data.message,
											id: t
										})
									} else {
										toast.success("Success!", {
											description: res?.data?.message,
											id: t
										})
									}
								});
							}}
						>
							Ping
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(monitor.id);
								toast("Copied ID to clipboard.");
							}}
						>
							Copy ID
						</DropdownMenuItem>
						{RankedRoles[currentMember.role] >= RankedRoles.admin && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={() => {
										setDeleteOpen(true);
									}}
								>
									<Trash /> Delete
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}
