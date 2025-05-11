import { columns } from "@/app/admin/[workspaceSlug]/monitors/columns";
import { CreateMonitorButton } from "@/components/monitors/create-monitor";
import { DataTable } from "@/components/ui/data-table";
import { monitors } from "@/lib/db/schema/monitors";
import db from "@/lib/db";
import { getAllMonitorUptime } from "@/lib/db/utils";
import { Monitor } from "@/types/monitor";
import { eq } from "drizzle-orm";
import { workspaces } from "@/lib/db/schema";
import { RankedRoles } from "@/types/workspace";
import { getCurrentMember } from "@/components/workspace/actions";
import { redirect } from "next/navigation";

export interface MonitorRow extends Monitor {
	uptime: number;
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
							The full list of all your monitors.
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
					<DataTable columns={columns} data={data} />
				</div>
			</div>
		</>
	);
}
