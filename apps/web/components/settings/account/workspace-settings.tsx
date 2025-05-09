"use client"

import LeaveWorkspaceButton from "@/components/settings/team/leave-workspace"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { WorkspaceWithMembers } from "@/types/workspace"
import React from "react"

export default function WorkspaceSettings({ workspaces }: { workspaces: WorkspaceWithMembers[] }) {
	return (
		<>
			<div className="flex flex-col gap-4 w-full">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Role</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{workspaces.map((workspace) => (
							<TableRow key={workspace.id}>
								<TableCell className="font-medium">{workspace.workspace.name}</TableCell>
								<TableCell>{workspace.workspace.slug}</TableCell>
								<TableCell>{workspace.role}</TableCell>
								<TableCell>
									<div className="flex flex-row gap-2 justify-end">
										{workspace.role !== "owner" && (
											<LeaveWorkspaceButton workspace={workspace.workspace} />
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	)
}