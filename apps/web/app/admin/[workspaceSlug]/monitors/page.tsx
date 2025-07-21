import { columns } from "@/app/admin/[workspaceSlug]/monitors/columns";
import { CreateMonitorButton } from "@/components/monitors/create-monitor";
import { monitors } from "@/lib/db/schema/monitors";
import db from "@/lib/db";
import { getAllMonitorUptime } from "@/lib/db/utils";
import { Monitor } from "@miru/types";
import { eq } from "drizzle-orm";
import { workspaces } from "@/lib/db/schema";
import { RankedRoles, WorkspaceMember } from "@miru/types";
import { getCurrentMember } from "@/components/workspace/actions";
import { redirect } from "next/navigation";
import { MonitorIcon } from "lucide-react";
import { MonitorDataTable } from "@/app/admin/[workspaceSlug]/monitors/table";

export interface MonitorRow extends Monitor {
	uptime: number;
}

function EmptyState({ currentMember }: { currentMember: WorkspaceMember }) {
	return (
		<div className="flex flex-col items-center justify-center w-full h-full gap-4 py-4">
			<div className="border rounded-lg p-2 bg-muted/80">
				<MonitorIcon />
			</div>
			<div className="flex flex-col gap-1 items-center">
				<h2 className="text-lg font-semibold">
					No monitors found
				</h2>
				<p>
					Looks like you don&apos;t have any monitors yet.
				</p>
			</div>
			{RankedRoles[currentMember.role] >= RankedRoles.admin && (
				<CreateMonitorButton />
			)}
		</div>
	)
}

export default async function MonitorsPage({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;
	const workspace = await db
		.select()
		.from(workspaces)
		.where(eq(workspaces.slug, workspaceSlug))
		.limit(1)
		.then((res) => {
			return res[0];
		});

	const raw = await db
		.select()
		.from(monitors)
		.where(eq(monitors.workspaceId, workspace.id))
		.limit(50);

	const allUptimes = await getAllMonitorUptime(7);

	const currentMember = await getCurrentMember(workspace.id);

	if (!currentMember) {
		return redirect("/admin");
	}

	const data: MonitorRow[] = raw.map((monitor) => {
		const uptime = allUptimes.find((u) => u.monitor_id === monitor.id);

		return {
			...monitor,
			uptime: uptime?.uptime_percentage || 0,
			workspaceId: workspace.id
		};
	});

	return (
		<>
			<div className="flex flex-col w-full h-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Monitors
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							An automated way to keep track of your services&apos; status.
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						{RankedRoles[currentMember.role] >= RankedRoles.admin && (
							<>
								<CreateMonitorButton />
							</>
						)}
					</div>
				</div>
				<div className="mt-4">
					<MonitorDataTable columns={columns} data={data} emptyComponent={<EmptyState currentMember={currentMember} />} />
				</div>
			</div>
		</>
	);
}
