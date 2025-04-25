import EditStatusPageForm from "@/app/admin/[workspaceSlug]/status-pages/[id]/form";
import { getCurrentMember } from "@/components/workspace/actions";
import db from "@/lib/db";
import { monitors, statusPages, workspaces } from "@/lib/db/schema";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages";
import { RankedRoles } from "@/types/workspace";
import { eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation";

export default async function CreateStatusPage({
	params,
}: {
	params: Promise<{ workspaceSlug: string, id: string }>;
}) {
	const { workspaceSlug, id } = await params;
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

	const statusPage: StatusPageWithMonitorsExtended = await db.query.statusPages.findMany({
		with: {
			statusPageMonitors: {
				with: {
					monitor: true,
				}
			}
		},
		where: () => eq(statusPages.id, id)
	}).then((res) => res[0]);

	if (!statusPage) {
		return notFound();
	}

	const currentMember = await getCurrentMember(workspace.id);

	if (!currentMember) {
		return redirect("/auth/login");
	}

	if (RankedRoles[currentMember.role] < RankedRoles.admin) {
		return notFound();
	}

	return (
		<>
			<div className="flex flex-col w-full h-full gap-8">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Editing {statusPage.name}
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							You are currently editing the status page {statusPage.name}.
							Any changes you save will be reflected on the page.
						</p>
					</div>
				</div>
				<EditStatusPageForm existing={statusPage} monitors={mons} workspace={workspace} />
			</div >
		</>
	)
}