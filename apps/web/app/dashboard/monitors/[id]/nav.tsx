"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function MonitorSingletonNavbar() {
	const params = useParams<{ id: string }>();
	const path = usePathname();

	return (
		<>
			<div className="flex w-full max-w-[200px] flex-col gap-2">
				<Link
					href={`/dashboard/monitors/${params.id}`}
					className="w-full"
				>
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start",
							`${
								path === `/dashboard/monitors/${params.id}`
									? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
									: ""
							}`
						)}
					>
						Overview
					</Button>
				</Link>
				<Link
					href={`/dashboard/monitors/${params.id}/logs`}
					className="w-full"
				>
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start",
							`${
								path === `/dashboard/monitors/${params.id}/logs`
									? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
									: ""
							}`
						)}
					>
						Ping Logs
					</Button>
				</Link>
				<Link
					href={`/dashboard/monitors/${params.id}/settings`}
					className="w-full"
				>
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start flex flex-row gap-2",
							`${
								path ===
								`/dashboard/monitors/${params.id}/settings`
									? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
									: ""
							}`
						)}
					>
						<span>Settings</span>
					</Button>
				</Link>
			</div>
		</>
	);
}
