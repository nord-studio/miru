import NavLinks from "@/app/admin/[workspaceSlug]/nav/links";
import AuthMenu from "@/components/auth/auth-dialog";
import UserDropdown from "@/components/auth/user-dropdown";
import MobileNavbar from "@/components/nav/mobile";
import { ThemeDropdown } from "@/components/theme/dropdown";
import { WorkspaceSwitcher } from "@/components/workspace/switcher";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Navbar() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<nav className="flex flex-row gap-2 items-center">
			<WorkspaceSwitcher />
			<div className="sm:flex flex-row items-center justify-start w-full hidden">
				<NavLinks />
			</div>
			<div className="sm:hidden w-full" />
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
