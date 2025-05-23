"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { RankedRoles, Workspace, WorkspaceMemberWithUser } from "@/types/workspace";
import KickWorkspaceMemberButton from "@/components/settings/team/kick-member";
import LeaveWorkspaceButton from "@/components/settings/team/leave-workspace";
import ManageMember from "@/components/settings/team/manage-member";

export interface TeamTableRow extends WorkspaceMemberWithUser {
	workspace: Workspace;
	currentMember: WorkspaceMemberWithUser;
	moreThanOneOwner: boolean;
}

export const columns: ColumnDef<TeamTableRow>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<div className="items-center flex">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) =>
						table.toggleAllPageRowsSelected(!!value)
					}
					aria-label="Select all"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="items-center flex">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => {
			return (
				<p className="font-medium w-fit">
					{row.original.user.name}
				</p>
			);
		},
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => {
			return (
				<p className="font-medium" suppressHydrationWarning={true}>
					{row.original.user.email}
				</p>
			);
		},
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			return (
				<p>
					{row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1)}
				</p>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<div className="text-right">
					{row.original.id === row.original.currentMember.id ? (
						<>
							{row.original.currentMember.role === "owner" && row.original.moreThanOneOwner && (
								<LeaveWorkspaceButton workspace={row.original.workspace} />
							)}
						</>
					) : (
						<div className="flex flex-row gap-2 justify-end">
							{RankedRoles[
								row.original.currentMember?.role as keyof typeof RankedRoles
							] >= RankedRoles[row.original.role] && (
									<div className="flex flex-row gap-2 justify-end">
										<ManageMember
											member={row.original}
											currentMember={row.original.currentMember}
										/>
										{row.original.currentMember.role === "owner" &&
											row.original.currentMember.id !== row.original.id && (
												<>
													<KickWorkspaceMemberButton member={row.original} />
												</>
											)}
									</div>
								)}
						</div>
					)}
				</div>
			);
		},
	},
];
