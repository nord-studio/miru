import { columns } from "@/app/dashboard/monitors/columns";
import { DataTable } from "@/components/ui/data-table";

export default function MonitorsPage() {
	const data = [
		{
			id: "1",
			name: "Website",
			type: "HTTP",
			url: "https://tygr.dev",
			interval: 120,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			uptime: 100,
			lastPing: Date.now() - 1000 * 60 * 1,
		},
		{
			id: "2",
			name: "nordstud.io",
			type: "HTTP",
			url: "https://nordstud.io",
			interval: 300,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			uptime: 98.4,
			lastPing: Date.now() - 1000 * 60 * 4,
		},
	];
	return (
		<>
			<div>
				<h1 className="text-3xl font-black font-display">Monitors</h1>
				<p className="text-neutral-500 dark:text-neutral-400">
					The full list of all your monitors.
				</p>
				<div className="container mx-auto mt-4">
					<DataTable columns={columns} data={data} />
				</div>
			</div>
		</>
	);
}
