import { DeleteAccountConfirm } from "@/components/settings/account/delete-account";
import SecurityUserSettings from "@/components/settings/account/security-settings";
import UserSettings from "@/components/settings/account/user-settings";
import WorkspaceSettings from "@/components/settings/account/workspace-settings";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function UserAccountPage() {
	const headerList = await headers();
	const data = await auth.api.getSession({
		headers: headerList
	});

	if (!data || !data.user) {
		return redirect("/auth/login");
	}

	const workspaces = await db.query.workspaceMembers.findMany({
		with: {
			workspace: true,
			user: true
		}
	});

	const filteredWorkspaces = workspaces.filter((w) => w.user.id === data.user.id);

	return (
		<>
			<main className="flex flex-col items-start justify-start gap-16 w-full">
				<div className="flex flex-col gap-4 w-full">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Your Account
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Update your account settings, manage workspaces, and more.
						</p>
					</div>
					<UserSettings user={data.user} />
				</div>
				<div className="flex flex-col gap-4 w-full">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Account Security
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Update your email, password and other security settings.
						</p>
					</div>
					<SecurityUserSettings user={data.user} />
				</div>
				<div className="flex flex-col gap-4 w-full">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Your Workspaces
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Update your account settings, manage workspaces, and more.
						</p>
					</div>
					<WorkspaceSettings workspaces={filteredWorkspaces} />
				</div>
				<div className="flex flex-col gap-4 w-full">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Danger Zone
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Be careful with these settings. Here be dragons!
						</p>
					</div>
					<div className="flex flex-col gap-4 w-full">
						<div className="flex flex-col gap-4 pb-4 sm:gap-8">
							<div className="flex w-full flex-col rounded-md border border-red-500/40">
								<div className="flex flex-col gap-4 border-b border-red-500/40 p-6">
									<div className="flex flex-col gap-2">
										<h1 className="text-xl font-bold">Delete Account</h1>
										<p className="text-sm">
											Permanently delete your account and all of its contents from
											your Miru instance. This action is not reversible, so
											please continue with caution.
										</p>
									</div>
								</div>
								<div className="flex flex-row items-center justify-between gap-4 bg-red-500/10 p-4">
									<div />
									<DeleteAccountConfirm user={data.user} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}