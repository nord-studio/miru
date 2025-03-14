"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Cog, TriangleAlert, User2 } from "lucide-react";
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
					{/* <Link href="/admin/settings/team" className="w-full">
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start",
								`${
									path === "/admin/settings/team"
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
								}`
							)}
						>
							<Users />
							Team
						</Button>
					</Link> */}
					{/* <Link href="/admin/settings/tokens" className="w-full">
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start flex flex-row gap-2",
								`${
									path === "/admin/settings/tokens"
										? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
										: ""
								}`
							)}
						>
							<Code />
							<span>API Tokens</span>
						</Button>
					</Link> */}
					<Link
						href={`/admin/${path.split("/")[2]}/settings/profile`}
						className="w-full"
					>
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start flex flex-row gap-2",
								`${path ===
									`/admin/${path.split("/")[2]
									}/settings/profile`
									? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
									: ""
								}`
							)}
						>
							<User2 />
							<span>Profile</span>
						</Button>
					</Link>
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
				</div>
				<hr className="w-full border border-black/10 dark:border-white/10 sm:hidden" />
				<div className="w-full">{children}</div>
			</div>
		</>
	);
}
