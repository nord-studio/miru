import UserDropdown from "@/components/auth/user-dropdown";
import MobileNavbar from "@/app/admin/[workspaceSlug]/nav/mobile";
import { ThemeDropdown } from "@/components/theme/dropdown";
import { getAllWorkspacesWithMembers } from "@/components/workspace/actions";
import { WorkspaceSwitcher } from "@/components/workspace/switcher";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import TrackingTabs from "@/components/ui/tracking-tabs";
import { Bell, Calendar, Cog, File, Monitor, TriangleAlert } from "lucide-react";
import { getConfig } from "@/lib/config";

export default async function Navbar({ workspaceSlug }: { workspaceSlug: string }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return null;
	}

	const workspaces = await getAllWorkspacesWithMembers();
	const filteredWorkspaces = workspaces?.data?.filter((w) => w.user.id === session.user.id) ?? [];
	const { config } = await getConfig();

	const links = [
		{
			label: "Monitors",
			href: `/admin/${workspaceSlug}/monitors`,
			icon: <Monitor className="size-4" />
		},
		{
			label: "Incidents",
			href: `/admin/${workspaceSlug}/incidents`,
			icon: <TriangleAlert className="size-4" />
		},
		{
			label: "Status Pages",
			href: `/admin/${workspaceSlug}/status-pages`,
			icon: <File className="size-4" />
		},
		{
			label: "Notifications",
			href: `/admin/${workspaceSlug}/notifications`,
			icon: <Bell className="size-4" />
		},
		{
			label: "Events",
			href: `/admin/${workspaceSlug}/events`,
			icon: <Calendar className="size-4" />
		},
		{
			label: "Settings",
			href: `/admin/${workspaceSlug}/settings`,
			icon: <Cog className="size-4" />
		}
	];

	return (
		<nav className="flex flex-col items-start gap-3 w-full md:pb-2">
			<div className="flex flex-row gap-2 items-center justify-start w-full">
				<div className="flex flex-row gap-3 md:gap-4 items-center justify-start w-full md:pl-2">
					<div className="flex-row items-center hidden md:flex">
						<h2 className="text-lg font-black font-display text-neutral-500 dark:text-neutral-400 whitespace-nowrap after:content-['見る'] hover:after:content-['Miru']">
						</h2>
					</div>
					<WorkspaceSwitcher workspaces={filteredWorkspaces} user={session.user} config={config} />
				</div>
				<div className="flex flex-row gap-3 items-center justify-end w-full">
					<div className="hidden md:block">
						<ThemeDropdown />
					</div>
					<div className="flex flex-row gap-2 items-center justify-end">
						{session && (
							<UserDropdown user={session.user} />
						)}
						<div className="block md:hidden">
							<MobileNavbar />
						</div>
					</div>
				</div>
			</div>
			<div className="md:flex flex-row items-center justify-start w-full hidden">
				<TrackingTabs
					links={links}
					bottomBorder={true}
				/>
			</div>
		</nav>
	);
}
