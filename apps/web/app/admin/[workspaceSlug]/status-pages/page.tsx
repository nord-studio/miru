import { columns } from "@/app/admin/[workspaceSlug]/status-pages/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentMember } from "@/components/workspace/actions";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { statusPages } from "@/lib/db/schema/status-pages";
import { StatusPageWithMonitorsExtended } from "@miru/types";
import { RankedRoles, WorkspaceMember } from "@miru/types";
import { eq } from "drizzle-orm";
import { FileTextIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

function EmptyState({ workspaceSlug, currentMember }: { workspaceSlug: string, currentMember: WorkspaceMember }) {
	return (
		<div className="flex flex-col items-center justify-center w-full h-full gap-4 py-4">
			<div className="border rounded-lg p-2 bg-muted/80">
				<FileTextIcon />
			</div>
			<div className="flex flex-col gap-1 items-center">
				<h2 className="text-lg font-semibold">
					No pages found
				</h2>
				<p>
					Looks like you don&apos;t have any status pages yet.
				</p>
			</div>
			{RankedRoles[currentMember.role] >= RankedRoles.admin && (
				<Link href={`/admin/${workspaceSlug}/status-pages/new`}>
					<Button>
						<PlusIcon />
						Create Page
					</Button>
				</Link>
			)}
		</div>
	)
}

export default async function StatusPagesIndexPage({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;

	const workspace = await db.query.workspaces.findMany({
		where: () => eq(workspaces.slug, workspaceSlug),
	}).then((res) => res[0]);

	const pages: StatusPageWithMonitorsExtended[] = await db.query.statusPages.findMany({
		with: {
			statusPageMonitors: {
				with: {
					monitor: true
				}
			}
		},
		where: () => eq(statusPages.workspaceId, workspace.id)
	});

	const currentMember = await getCurrentMember(workspace.id);

	if (!currentMember) {
		return redirect("/admin");
	}

	return (
		<>
			<div className="flex flex-col w-full h-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Status Pages
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							The list of all your status pages.
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						{RankedRoles[currentMember.role] >= RankedRoles.admin && (
							<Link href={`/admin/${workspaceSlug}/status-pages/new`}>
								<Button className="hidden xs:flex">
									<PlusIcon />
									Create Page
								</Button>
								<Button size="icon" className="flex xs:hidden">
									<PlusIcon />
								</Button>
							</Link>
						)}
					</div>
				</div>
				<div className="mt-4">
					<DataTable data={pages} columns={columns} emptyComponent={<EmptyState workspaceSlug={workspace.slug} currentMember={currentMember} />} />
				</div>
			</div>
		</>
	)
}
