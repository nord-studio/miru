import { columns } from "@/app/admin/[workspaceSlug]/status-pages/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { statusPageMonitors, statusPages } from "@/lib/db/schema/status-pages";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages";
import { eq } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

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

	return (
		<>
			<div className="flex flex-col w-full h-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Status Pages
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Overview of all your pages.
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						<Link href={`/admin/${workspaceSlug}/status-pages/new`}>
							<Button>
								<PlusIcon />
								<span className="hidden sm:block">Create Page</span>
							</Button>
						</Link>
					</div>
				</div>
				<div className="container mx-auto mt-4">
					<DataTable data={pages} columns={columns} />
				</div>
			</div>
		</>
	)
}
