import MonitorSingletonSettingsForm from "@/app/admin/[workspaceSlug]/monitors/[id]/settings/form";
import { getCurrentMember } from "@/components/workspace/actions";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { monitors } from "@/lib/db/schema/monitors";
import { RankedRoles } from "@miru/types";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

export default async function MonitorSingletonSettingsPage({
	params,
}: {
	params: Promise<{ workspaceSlug: string, id: string }>;
}) {
	const { workspaceSlug, id } = await params;
	const monitor = await db
		.select()
		.from(monitors)
		.where(eq(monitors.id, id))
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

	if (RankedRoles[currentMember.role] === RankedRoles.member) {
		return notFound();
	}

	return <MonitorSingletonSettingsForm monitor={monitor} />;
}
