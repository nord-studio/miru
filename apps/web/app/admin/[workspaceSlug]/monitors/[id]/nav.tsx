"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RankedRoles, WorkspaceMemberWithUser } from "@/types/workspace";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function MonitorSingletonNavbar({ currentMember }: { currentMember: WorkspaceMemberWithUser }) {
	const params = useParams<{ workspaceSlug: string; id: string }>();
	const path = usePathname();

	return (
		<>
			<div className="flex w-full md:max-w-[200px] flex-col gap-2">
				<Link
					href={`/admin/${params.workspaceSlug}/monitors/${params.id}`}
					className="w-full"
				>
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start",
							`${path ===
								`/admin/${params.workspaceSlug}/monitors/${params.id}`
								? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
								: ""
							}`
						)}
					>
						Overview
					</Button>
				</Link>
				<Link
					href={`/admin/${params.workspaceSlug}/monitors/${params.id}/logs`}
					className="w-full"
				>
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start",
							`${path ===
								`/admin/${params.workspaceSlug}/monitors/${params.id}/logs`
								? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
								: ""
							}`
						)}
					>
						Ping Logs
					</Button>
				</Link>
				{RankedRoles[currentMember.role] >= RankedRoles.admin && (
					<Link
						href={`/admin/${params.workspaceSlug}/monitors/${params.id}/settings`}
						className="w-full"
					>
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start flex flex-row gap-2",
								`${path ===
									`/admin/${params.workspaceSlug}/monitors/${params.id}/settings`
									? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
									: ""
								}`
							)}
						>
							<span>Settings</span>
						</Button>
					</Link>
				)}
			</div>
		</>
	);
}
