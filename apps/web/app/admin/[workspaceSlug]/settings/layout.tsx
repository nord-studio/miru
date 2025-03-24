import SettingsLinks from "@/app/admin/[workspaceSlug]/settings/links";
import { getCurrentMember } from "@/components/workspace/actions";
import db from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
	children,
	params
}: {
	children: React.ReactNode;
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;
	const workspace = await db.select().from(workspaces).where(eq(workspaces.slug, workspaceSlug)).then((data) => data[0]);
	const currentMember = await getCurrentMember(workspace.id);

	if (!currentMember) {
		return redirect("/auth/login");
	}

	return (
		<>
			<div className="flex flex-col gap-4 sm:gap-6 md:gap-8 sm:flex-row mt-4 sm:mt-0 w-full">
				<SettingsLinks currentMember={currentMember} />
				<hr className="w-full border border-black/10 dark:border-white/10 sm:hidden" />
				<div className="w-full">{children}</div>
			</div>
		</>
	);
}
