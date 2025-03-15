import MonitorDetailNav from "@/app/admin/[workspaceSlug]/monitors/[id]/nav";
import MonitorActionsDropdown from "@/components/monitors/monitor-dropdown";
import { EditMonitorButton } from "@/components/monitors/edit-monitor";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema/monitors";
import { eq } from "drizzle-orm";
import Link from "next/link";
import React from "react";

export default async function MonitorSingletonLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	const monitor = await db
		.select()
		.from(monitors)
		.where(eq(monitors.id, id))
		.limit(1)
		.then((res) => res[0]);
	return (
		<>
			<MonitorDetailNav />
			<div className="w-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							{monitor.name}
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							<Link
								href={`https://${monitor.url}`}
								target="_blank"
							>
								{monitor.type === "http" && "https://"}
								{monitor.url}
							</Link>{" "}
							• {monitor.type.toUpperCase()} • every{" "}
							{monitor.interval}m
						</p>
					</div>
					<div className="flex flex-row gap-3 items-center">
						<EditMonitorButton monitor={monitor} />
						<MonitorActionsDropdown
							monitor={monitor}
							variant="outline"
							size="icon"
						/>
					</div>
				</div>
				<div className="container mx-auto mt-4">{children}</div>
			</div>
		</>
	);
}
