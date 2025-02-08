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
		<nav className="flex flex-row gap-2 items-center justify-between p-4">
			<p className="text-neutral-500 dark:text-neutral-400">Iris</p>
			<div className="flex flex-row items-center justify-start w-full">
				<Link href="/dashboard">
					<Button variant="link">Dashboard</Button>
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
