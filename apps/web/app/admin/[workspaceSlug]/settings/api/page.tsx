import CreateApiKey from "@/components/settings/api/create-key";
import { listApiKeys } from "@/components/settings/api/actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Code2, Plus } from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getCurrentMember } from "@/components/workspace/actions";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/app/admin/[workspaceSlug]/settings/api/columns";
import { Workspace, WorkspaceMember } from "@/types/workspace";

function EmptyState({ workspace, currentMember }: { workspace: Workspace, currentMember: WorkspaceMember }) {
	return (
		<div className="flex flex-col items-center justify-center mx-auto h-full gap-4 py-4 rounded-lg w-fit">
			<div className="border rounded-lg p-2 bg-muted/80">
				<Code2 />
			</div>
			<div className="flex flex-col gap-1 items-center">
				<h2 className="text-lg font-semibold">
					No API keys found
				</h2>
				<p>
					Looks like you haven&apos;t created any API keys yet.
				</p>
			</div>
			{currentMember.role !== "member" && (
				<CreateApiKey
					workspace={workspace}
				>
					<Button>
						<Plus />
						Create Key
					</Button>
				</CreateApiKey>
			)}
		</div>
	)
}

export default async function ApiSettingsPage({
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
		.then((res) => res[0]);

	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	if (!currentUser) {
		throw new Error("You are not logged in");
	}

	const currentMember = await getCurrentMember(workspace.id, currentUser?.user.id);

	if (!currentMember) {
		throw new Error("You are not a member of this workspace");
	}

	const keys = await listApiKeys({
		workspaceId: workspace.id
	});

	if (!keys || !keys.data) {
		throw new Error("Failed to fetch API keys")
	}

	if (keys?.data?.error) {
		throw new Error(`${keys.data.message}`)
	};

	if (!keys?.data || !keys.data.data) {
		return notFound();
	}

	return (
		<>
			<main className="flex flex-col gap-4 w-full">
				<div className="flex flex-row gap-4 items-center w-full">
					<div className="flex flex-col w-full">
						<h1 className="text-3xl font-black font-display">API Keys</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Control your workspace programmatically with our API.
						</p>
					</div>
					{currentMember.role !== "member" && (
						<>
							<div className="md:flex flex-row gap-3 hidden">
								<CreateApiKey
									workspace={workspace}
								>
									<Button>
										<Plus />
										Create API Key
									</Button>
								</CreateApiKey>
							</div>
							<div className="flex flex-row gap-3 md:hidden">
								<CreateApiKey
									workspace={workspace}
								>
									<Button>
										<Plus />
										Create
									</Button>
								</CreateApiKey>
							</div>
						</>
					)}
				</div>
				<DataTable columns={columns} data={keys.data.data} emptyComponent={<EmptyState workspace={workspace} currentMember={currentMember} />} />
			</main>
		</>
	)
}