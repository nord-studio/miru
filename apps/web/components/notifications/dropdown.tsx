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
import React from "react";
import { VariantProps } from "class-variance-authority";
import { usePathname } from "next/navigation";
import { RankedRoles, WorkspaceMemberWithUser } from "@/types/workspace";
import { getCurrentMember } from "@/components/workspace/actions";
import Spinner from "@/components/ui/spinner";
import { NotificationWithMonitors } from "@/types/notifications";
import DeleteNotification from "@/components/notifications/delete-channel";
import EditNotification from "@/components/notifications/edit-channel";
import { Monitor } from "@/types/monitor";
import { getAllMonitors } from "@/components/monitors/actions";

export default function NotificationActionsDropdown({
	notification,
	monitors,
	workspaceId,
	...props
}: {
	notification: NotificationWithMonitors;
	monitors?: Monitor[];
	workspaceId: string;
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>) {
	const pathname = usePathname();
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [currentMember, setCurrentMember] = React.useState<WorkspaceMemberWithUser | null>(null);
	const [allMonitors, setAllMonitors] = React.useState<
		Monitor[]
	>([]);

	React.useEffect(() => {
		if (monitors) {
			setAllMonitors(monitors);
		} else {
			getAllMonitors().then((res) => {
				setAllMonitors(res?.data ?? []);
			});
		}
	}, [monitors]);

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
						<DeleteNotification
							open={deleteOpen}
							setOpen={setDeleteOpen}
							id={notification.id}
						/>
						<EditNotification
							notification={notification}
							monitors={allMonitors}
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
							href={`/admin/${pathname.split("/")[2]}/notifications/${notification.id}`}
						>
							<DropdownMenuItem>Details</DropdownMenuItem>
						</Link>
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(notification.id);
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
