import NewStatusPageForm from "@/app/admin/[workspaceSlug]/status-pages/new/form";
import { getCurrentMember } from "@/components/workspace/actions";
import { getConfig } from "@/lib/config";
import db from "@/lib/db";
import { monitors, workspaces } from "@/lib/db/schema";
import { RankedRoles } from "@/types/workspace";
import { eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation";

export default async function CreateStatusPage({
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

	const mons = await db
		.select()
		.from(monitors)
		.where(eq(monitors.workspaceId, workspace.id));

	const currentMember = await getCurrentMember(workspace.id);

	if (!currentMember) {
		return redirect("/auth/login");
	}

	if (RankedRoles[currentMember.role] < RankedRoles.admin) {
		return notFound();
	}

	const { config } = await getConfig();

	return (
		<>
			<div className="flex flex-col w-full h-full gap-8">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Create Status Page
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Please fill in the details below to create a new
							status page.
						</p>
					</div>
				</div>
				<NewStatusPageForm monitors={mons} workspace={workspace} config={config} />
			</div >
		</>
	)
}