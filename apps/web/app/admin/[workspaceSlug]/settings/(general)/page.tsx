import WorkspaceGeneralSettingsFields from "@/app/admin/[workspaceSlug]/settings/(general)/fields";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfileSettingsPage({
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

	return (
		<>
			<main className="flex flex-col gap-4 item-start w-full">
				<div className="flex flex-col">
					<h1 className="text-3xl font-black font-display">
						General
					</h1>
					<p className="text-neutral-500 dark:text-neutral-400">
						All general settings regarding your workspace.
					</p>
				</div>
				<WorkspaceGeneralSettingsFields workspace={workspace} />
			</main>
		</>
	);
}
