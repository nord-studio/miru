import { getFirstWorkspace } from "@/app/onboarding/actions";
import OnboardingStatusPageForm from "@/app/onboarding/page/form";
import db from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { eq } from "drizzle-orm"

export default async function OnboardingStatusPage() {
	const workspace = await getFirstWorkspace();

	const mons = await db
		.select()
		.from(monitors)
		.where(eq(monitors.workspaceId, workspace.id));

	return (
		<>
			<div className="flex flex-row w-full gap-4 h-screen items-start py-8">
				<OnboardingStatusPageForm workspace={workspace} monitors={mons} />
			</div>
		</>
	)
}