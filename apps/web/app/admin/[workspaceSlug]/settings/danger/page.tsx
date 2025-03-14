import { DeleteAccountConfirm } from "@/app/admin/[workspaceSlug]/settings/danger/confirm";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspaceDangerSettingsPage({
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

	const session = await auth.api.getSession({
		headers: await headers() // you need to pass the headers object.
	});

	if (!session) redirect("/auth/login");

	return (
		<>
			<main className="flex flex-col gap-4 item-start w-full">
				<div className="flex flex-col gap-4 pb-4 sm:gap-8">
					<div className="flex w-full flex-col rounded-md border border-red-500/40">
						<div className="flex flex-col gap-4 border-b border-red-500/40 p-6">
							<div className="flex flex-col gap-2">
								<h1 className="text-xl font-bold">Delete Workspace</h1>
								<p className="text-sm">
									Permanently delete the workspace <span className="font-semibold">&quot;{workspace.name}&quot;</span> and all of its contents from
									your Miru instance. This action is not reversible, so
									please continue with caution.
								</p>
							</div>
						</div>
						<div className="flex flex-row items-center justify-between gap-4 bg-red-500/10 p-4">
							<div />
							<DeleteAccountConfirm user={session?.user}>
								<Button variant="destructive">Delete Workspace</Button>
							</DeleteAccountConfirm>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}