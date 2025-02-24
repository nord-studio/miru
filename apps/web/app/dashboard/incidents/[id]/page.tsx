import { getIncidentsWithMonitors } from "@/lib/db/utils";
import { notFound } from "next/navigation";

export default async function IncidentSingletonPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const incident = await getIncidentsWithMonitors(id);

	if (!incident) {
		return notFound();
	}

	return <></>;
}
