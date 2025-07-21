import db from "@/lib/db";
import { Monitor } from "@miru/types";
import { eq } from "drizzle-orm";
import { monitors, workspaces } from "@/lib/db/schema";
import { RankedRoles, WorkspaceMember } from "@miru/types";
import { getCurrentMember } from "@/components/workspace/actions";
import { redirect } from "next/navigation";
import { CalendarOff } from "lucide-react";
import { getAllEventsWithMonitors } from "@/components/events/actions";
import { columns } from "@/app/admin/[workspaceSlug]/events/columns";
import { CreateEventButton } from "@/components/events/create-event";
import { EventDataTable } from "@/app/admin/[workspaceSlug]/events/table";

export interface MonitorRow extends Monitor {
	uptime: number;
}

function EmptyState({ currentMember, monitors }: { currentMember: WorkspaceMember, monitors: Monitor[] }) {
	return (
		<div className="flex flex-col items-center justify-center w-full h-full gap-4 py-4">
			<div className="border rounded-lg p-2 bg-muted/80">
				<CalendarOff />
			</div>
			<div className="flex flex-col gap-1 items-center">
				<h2 className="text-lg font-semibold">
					No events found
				</h2>
				<p>
					Looks like you haven&apos;t scheduled any events yet.
				</p>
			</div>
			{RankedRoles[currentMember.role] >= RankedRoles.admin && (
				<CreateEventButton monitors={monitors} />
			)}
		</div>
	)
}

export default async function EventsPage({
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

	const data = await getAllEventsWithMonitors(workspace.id);

	const mons = await db
		.select()
		.from(monitors)
		.where(eq(monitors.workspaceId, workspace.id));

	return (
		<>
			<div className="flex flex-col w-full h-full">
				<div className="w-full flex flex-row gap-2 items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-3xl font-black font-display">
							Events
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Schedule downtime events in advance.
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						{RankedRoles[currentMember.role] >= RankedRoles.admin && (
							<>
								<CreateEventButton monitors={mons} />
							</>
						)}
					</div>
				</div>
				<div className="mt-4">
					<EventDataTable columns={columns} data={data} emptyComponent={<EmptyState currentMember={currentMember} monitors={mons} />} />
				</div>
			</div>
		</>
	);
}
