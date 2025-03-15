import NavLinks from "@/app/admin/[workspaceSlug]/nav/links";
import AuthMenu from "@/components/auth/auth-dialog";
import UserDropdown from "@/components/auth/user-dropdown";
import MobileNavbar from "@/app/admin/[workspaceSlug]/nav/mobile";
import { ThemeDropdown } from "@/components/theme/dropdown";
import { getAllWorkspacesWithMembers } from "@/components/workspace/actions";
import { WorkspaceSwitcher } from "@/components/workspace/switcher";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Navbar() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const workspaces = await getAllWorkspacesWithMembers();

	return (
		<nav className="flex flex-row items-center w-full justify-between">
			<div className="flex flex-row gap-2 items-center justify-start w-full">
				<div>
					<WorkspaceSwitcher workspaces={workspaces?.data || []} />
				</div>
				<div className="md:flex flex-row items-center justify-start w-full hidden">
					<NavLinks />
				</div>
			</div>
			<div className="flex flex-row gap-3 items-center justify-end w-full">
				<div className="hidden md:block">
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
					<div className="block md:hidden">
						<MobileNavbar />
					</div>
				</div>
			</div>
		</nav>
	);
}
