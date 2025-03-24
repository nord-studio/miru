import DangerUserSettings from "@/app/admin/[workspaceSlug]/settings/account/danger";
import SecurityUserSettings from "@/app/admin/[workspaceSlug]/settings/account/security";
import UserSettings from "@/app/admin/[workspaceSlug]/settings/account/user";
import WorkspaceSettings from "@/app/admin/[workspaceSlug]/settings/account/workspaces";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function UserAccountPage() {
	const headerList = await headers();
	const user = await auth.api.getSession({
		headers: headerList
	});

	if (!user) {
		return redirect("/auth/login");
	}

	const workspaces = await db.query.workspaceMembers.findMany({
		with: {
			workspace: true,
			user: true
		}
	});

	const filteredWorkspaces = workspaces.filter((w) => w.user.id === user.user.id);

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
					<UserSettings user={user.user} />
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
					<SecurityUserSettings />
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
					<DangerUserSettings user={user.user} />
				</div>
			</main>
		</>
	)
}