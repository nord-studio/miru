"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Code, Cog, User2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const path = usePathname();

	return (
		<>
			<div className="flex flex-col gap-4 sm:gap-6 md:gap-8 sm:flex-row mt-4 sm:mt-0 w-full">
				<div className="flex w-full flex-col gap-2 sm:max-w-[200px]">
					<Link href="/dashboard/settings" className="w-full">
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start",
								`${
									path === "/dashboard/settings"
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
								}`
							)}
						>
							<Cog />
							General
						</Button>
					</Link>
					{/* <Link href="/dashboard/settings/team" className="w-full">
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start",
								`${
									path === "/dashboard/settings/team"
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
								}`
							)}
						>
							<Users />
							Team
						</Button>
					</Link> */}
					{/* <Link href="/dashboard/settings/tokens" className="w-full">
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start flex flex-row gap-2",
								`${
									path === "/dashboard/settings/tokens"
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
								}`
							)}
						>
							<Code />
							<span>API Tokens</span>
						</Button>
					</Link> */}
					<Link href="/dashboard/settings/profile" className="w-full">
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start flex flex-row gap-2",
								`${
									path === "/dashboard/settings/profile"
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
								}`
							)}
						>
							<User2 />
							<span>Profile</span>
						</Button>
					</Link>
				</div>
				<hr className="w-full border border-black/10 dark:border-white/10 sm:hidden" />
				<div className="w-full">{children}</div>
			</div>
		</>
	);
}
