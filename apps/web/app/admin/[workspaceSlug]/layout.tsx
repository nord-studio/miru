import Navbar from "@/app/admin/[workspaceSlug]/nav";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function DashboardLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;

	const currentUser = await auth.api.getSession({
		headers: await headers(),
	});

	if (!currentUser) {
		return notFound();
	}

	const data = await db.query.workspaces.findMany({
		with: {
			members: true,
		},
	});

	const workspaces = data.filter((workspace) =>
		workspace.members.some(
			(member) => member.userId === currentUser.user.id
		)
	);

	if (workspaces.length === 0) {
		return notFound();
	}

	if (!workspaces.find((workspace) => workspace.slug === workspaceSlug)) {
		return notFound();
	}

	return (
		<>
			<div className="flex flex-col w-full min-h-screen px-4 sm:px-6 py-2 sm:py-4">
				<Navbar workspaceSlug={workspaceSlug} />
				<div className="flex flex-col md:flex-row gap-8 h-screen-no-nav w-full py-4">
					{children}
				</div>
			</div>
		</>
	);
}
