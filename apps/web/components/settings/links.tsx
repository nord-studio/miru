"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RankedRoles, WorkspaceMemberWithUser } from "@/types/workspace";
import { Code, Cog, TriangleAlert, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLinks({ currentMember }: { currentMember: WorkspaceMemberWithUser }) {
	const path = usePathname();

	return (
		<>
			<div className="flex w-full flex-col gap-2 sm:max-w-[200px]">
				{RankedRoles[currentMember.role] >= RankedRoles.admin && (
					<>
						<Link
							href={`/admin/${path.split("/")[2]}/settings`}
							className="w-full"
						>
							<Button
								variant="ghost"
								className={cn(
									"w-full justify-start",
									`${path ===
										`/admin/${path.split("/")[2]}/settings`
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
									}`
								)}
							>
								<Cog />
								General
							</Button>
						</Link>
						<Link
							href={`/admin/${path.split("/")[2]}/settings/team`}
							className="w-full"
						>
							<Button
								variant="ghost"
								className={cn(
									"w-full justify-start flex flex-row gap-2",
									`${path ===
										`/admin/${path.split("/")[2]
										}/settings/team`
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
									}`
								)}
							>
								<Users />
								<span>Team</span>
							</Button>
						</Link>
						<Link
							href={`/admin/${path.split("/")[2]}/settings/api`}
							className="w-full"
						>
							<Button
								variant="ghost"
								className={cn(
									"w-full justify-start flex flex-row gap-2",
									`${path ===
										`/admin/${path.split("/")[2]
										}/settings/api`
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
									}`
								)}
							>
								<Code />
								<span>API</span>
							</Button>
						</Link>
					</>
				)}
				<Link
					href={`/admin/${path.split("/")[2]}/settings/account`}
					className="w-full"
				>
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start flex flex-row gap-2",
							`${path ===
								`/admin/${path.split("/")[2]
								}/settings/account`
								? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
								: ""
							}`
						)}
					>
						<User />
						<span>Account</span>
					</Button>
				</Link>
				{RankedRoles[currentMember.role] >= RankedRoles.owner && (
					<Link
						href={`/admin/${path.split("/")[2]}/settings/danger`}
						className="w-full"
					>
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start flex flex-row gap-2",
								`${path ===
									`/admin/${path.split("/")[2]
									}/settings/danger`
									? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
									: ""
								}`
							)}
						>
							<TriangleAlert />
							<span>Danger</span>
						</Button>
					</Link>
				)}
			</div>
		</>
	)
}