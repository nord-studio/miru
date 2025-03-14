import MonitorSingletonSettingsForm from "@/app/admin/[workspaceSlug]/monitors/[id]/settings/form";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema/monitors";
import { eq } from "drizzle-orm";

export default async function MonitorSingletonSettingsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	const monitor = await db
		.select()
		.from(monitors)
		.where(eq(monitors.id, id))
		.then((res) => res[0]);

	return <MonitorSingletonSettingsForm monitor={monitor} />;
}
