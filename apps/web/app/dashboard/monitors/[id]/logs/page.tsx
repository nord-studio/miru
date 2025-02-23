import { PingDataTable } from "@/app/dashboard/monitors/[id]/logs/table";

export default async function MonitorSingletonLogsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<>
			<PingDataTable id={id} />
		</>
	);
}
