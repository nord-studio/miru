import AuthMenu from "@/components/auth/auth-dialog";
import UserDropdown from "@/components/auth/user-dropdown";
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
			<div className="flex flex-row items-center justify-start w-full">
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
			<div className="flex flex-row gap-2 items-center justify-end">
				<ThemeDropdown />
				{session ? (
					<>
						<UserDropdown user={session.user} />
					</>
				) : (
					<>
						<AuthMenu />
					</>
				)}
			</div>
		</nav>
	);
}
