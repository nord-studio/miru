import AuthMenu from "@/components/auth/auth-dialog";
import UserDropdown from "@/components/auth/user-dropdown";
import MobileNavbar from "@/components/nav/mobile";
import { ThemeDropdown } from "@/components/theme/dropdown";
import { Button } from "@/components/ui/button";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Navbar() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<nav className="flex flex-row gap-2 items-center justify-between p-2 border border-black/10 dark:border-white/10 rounded-lg">
			<div className="sm:flex flex-row items-center justify-start w-full hidden">
				<Link href="/dashboard/monitors">
					<Button variant="link">Monitors</Button>
				</Link>
				<Link href="/dashboard/incidents">
					<Button variant="link">Incidents</Button>
				</Link>
				<Link href="/dashboard/status-page">
					<Button variant="link">Status Page</Button>
				</Link>
				<Link href="/dashboard/notifications">
					<Button variant="link">Notifications</Button>
				</Link>
				<Link href="/dashboard/settings">
					<Button variant="link">Settings</Button>
				</Link>
			</div>
			<div className="sm:hidden flex-row items-center justify-start w-full flex">
				<h2 className="px-2 text-lg font-black font-display text-neutral-500 dark:text-neutral-400">
					Iris
				</h2>
			</div>
			<div className="hidden sm:flex">
				<ThemeDropdown />
			</div>
			<div className="flex flex-row gap-2 items-center justify-end">
				{session ? (
					<>
						<UserDropdown user={session.user} />
					</>
				) : (
					<>
						<AuthMenu />
					</>
				)}

				<div className="flex sm:hidden">
					<MobileNavbar />
				</div>
			</div>
		</nav>
	);
}
