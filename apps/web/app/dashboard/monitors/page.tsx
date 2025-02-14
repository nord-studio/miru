import { columns } from "@/app/dashboard/monitors/columns";
import CreateMonitor from "@/app/dashboard/monitors/create-monitor";
import { DataTable } from "@/components/ui/data-table";
import { monitors } from "@/lib/db/schema";
import db from "@/lib/db";

export default async function MonitorsPage() {
	const data = await db.select().from(monitors).limit(50);

	return (
		<>
			<div>
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
