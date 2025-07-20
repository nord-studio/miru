import MonitorDetailNav from "@/app/admin/[workspaceSlug]/monitors/[id]/nav";
import MonitorActionsDropdown from "@/components/monitors/monitor-dropdown";
import { EditMonitorButton } from "@/components/monitors/edit-monitor";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema/monitors";
import { eq } from "drizzle-orm";
import Link from "next/link";
import React from "react";
import { workspaces } from "@/lib/db/schema";
import { RankedRoles } from "@miru/types";
import { getCurrentMember } from "@/components/workspace/actions";
import { redirect } from "next/navigation";

export default async function MonitorSingletonLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ workspaceSlug: string, id: string }>;
}) {
	const { workspaceSlug, id } = await params;
	const monitor = await db
		.select()
		.from(monitors)
		.where(eq(monitors.id, id))
		.limit(1)
		.then((res) => res[0]);

	const workspace = await db
		.select()
		.from(workspaces)
		.where(eq(workspaces.slug, workspaceSlug))
		.limit(1)
		.then((res) => {
			return res[0];
		});

	const currentMember = await getCurrentMember(workspace.id);

	if (!currentMember) {
		return redirect("/admin");
	}

	return (
		<>
			<MonitorDetailNav currentMember={currentMember} />
			<div className="w-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							{monitor.name}
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400 px-0.5">
							<Link
								href={`https://${monitor.url}`}
								target="_blank"
								className="hidden md:inline"
							>
								{monitor.type === "http" && "https://"}
								{monitor.url} {" "}• {" "}
							</Link>
							{monitor.type.toUpperCase()} • every{" "}
							{monitor.interval}m
						</p>
					</div>
					<div className="flex flex-row gap-3 items-center">
						{RankedRoles[currentMember.role] >= RankedRoles.admin && (
							<EditMonitorButton monitor={monitor} />
						)}
						<MonitorActionsDropdown
							monitor={monitor}
							workspaceId={workspace.id}
							variant="outline"
							size="icon"
						/>
					</div>
				</div>
				<div className="mt-4 w-full">{children}</div>
			</div>
		</>
	);
}
