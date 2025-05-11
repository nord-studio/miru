import { getFirstWorkspace } from "@/app/onboarding/actions";
import OnboardingStatusPageForm from "@/app/onboarding/page/form";
import { getCurrentMember } from "@/components/workspace/actions";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { RankedRoles } from "@/types/workspace";
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation";

export default async function OnboardingStatusPage() {
	const workspace = await getFirstWorkspace();

	const mons = await db
		.select()
		.from(monitors)
		.where(eq(monitors.workspaceId, workspace.id));

	const member = await getCurrentMember(workspace.id);

	if (!member) {
		return redirect("/admin");
	}

	if (RankedRoles[member.role] < RankedRoles.admin) {
		return redirect("/onboarding/conclusion");
	}

	return (
		<>
			<div className="flex flex-row w-full gap-4 h-screen items-start py-8">
				<OnboardingStatusPageForm workspace={workspace} monitors={mons} />
			</div>
		</>
	)
}