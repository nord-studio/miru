import { columns } from "@/app/admin/[workspaceSlug]/notifications/columns";
import { CreateChannelButton } from "@/components/notifications/create-channel";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentMember } from "@/components/workspace/actions";
import db from "@/lib/db";
import { monitors, notifications, workspaces } from "@/lib/db/schema";
import { Monitor } from "@/types/monitor";
import { NotificationWithMonitors } from "@/types/notifications";
import { RankedRoles, Workspace } from "@/types/workspace";
import { eq } from "drizzle-orm";
import { BellOffIcon } from "lucide-react";
import { redirect } from "next/navigation";

function EmptyState({ mons, workspace }: { mons: Monitor[]; workspace: Workspace }) {
	return (
		<div className="flex flex-col items-center justify-center w-full h-full gap-4 py-4">
			<div className="border rounded-lg p-2">
				<BellOffIcon />
			</div>
			<div className="flex flex-col gap-1 items-center">
				<h2 className="text-lg font-semibold">
					No channels found
				</h2>
				<p>
					Create a channel to notify your users when something goes wrong.
				</p>
			</div>
			<CreateChannelButton monitors={mons} workspace={workspace} />
		</div>
	)
}

export default async function NotificationsPage({
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

	const currentMember = await getCurrentMember(workspace.id);

	if (!currentMember) {
		return redirect("/admin");
	}

	const mons = await db.select().from(monitors).where(
		eq(monitors.workspaceId, workspace.id)
	);

	const raw = await db.query.notifications.findMany({
		where: () => eq(notifications.workspaceId, workspace.id),
		with: {
			notificationsToMonitors: {
				with: {
					monitor: true
				}
			}
		}
	});

	const data: NotificationWithMonitors[] = raw.map((notification) => {
		const monitors = notification.notificationsToMonitors.map((m) => {
			return m.monitor;
		});

		return {
			...notification,
			monitors
		};
	});

	return (
		<>
			<div className="flex flex-col w-full h-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Notification Channels
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							The full list of all your notification channels.
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						{RankedRoles[currentMember.role] >= RankedRoles.admin && (
							<>
								<CreateChannelButton monitors={mons} workspace={workspace} />
							</>
						)}
					</div>
				</div>
				<div className="mt-4">
					<DataTable columns={columns} data={data} emptyComponent={<EmptyState mons={mons} workspace={workspace} />} />
				</div>
			</div>
		</>
	)
}