import CreateApiKey from "@/components/settings/api/create-key";
import DeleteApiKey from "@/components/settings/api/revoke-key";
import { listApiKeys } from "@/components/settings/api/actions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { format, formatDistance } from "date-fns";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getCurrentMember } from "@/components/workspace/actions";
import ViewApiKey from "@/components/settings/api/view-key";

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
				<div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Expires In</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{keys?.data?.data.map((key) => (
								<TableRow key={key.id}>
									<TableCell className="font-medium">
										{key.name}
									</TableCell>
									<TableCell>{key.expiresAt ? formatDistance(new Date(), key.expiresAt) : "Never"}</TableCell>
									<TableCell>{format(key.createdAt, "dd-MM-yyyy")}</TableCell>
									<TableCell className="flex flex-row gap-2 justify-end">
										<ViewApiKey apiKey={key} />
										<DeleteApiKey id={key.id} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</main>
		</>
	)
}