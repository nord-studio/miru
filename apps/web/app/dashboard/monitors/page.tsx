import { columns } from "@/app/dashboard/monitors/columns";
import CreateMonitor from "@/components/monitors/create-menu";
import { DataTable } from "@/components/ui/data-table";
import { monitors } from "@/lib/db/schema/monitors";
import db from "@/lib/db";
import { getAllMonitorUptime } from "@/lib/db/utils";
import { Monitor } from "@/types/monitor";

interface MonitorRow extends Monitor {
	uptime: number;
}

export default async function MonitorsPage() {
	const raw = await db.select().from(monitors).limit(50);
	const allUptimes = await getAllMonitorUptime(7);

	const data: MonitorRow[] = raw.map((monitor) => {
		const uptime = allUptimes.find((u) => u.monitor_id === monitor.id);

		return {
			...monitor,
			uptime: uptime?.uptime_percentage || 0,
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
						<CreateMonitor />
					</div>
				</div>
				<div className="container mx-auto mt-4">
					<DataTable columns={columns} data={data} />
				</div>
			</div>
		</>
	);
}
