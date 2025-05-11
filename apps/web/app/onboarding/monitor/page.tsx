import { getFirstWorkspace } from "@/app/onboarding/actions";
import OnboardingMonitorForm from "@/app/onboarding/monitor/form";
import { getCurrentMember } from "@/components/workspace/actions";
import { RankedRoles } from "@/types/workspace";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function OnboardingMonitorPage() {
	const workspace = await getFirstWorkspace();
	const member = await getCurrentMember(workspace.id);

	if (!member) {
		return redirect("/admin");
	}

	if (RankedRoles[member.role] < RankedRoles.admin) {
		return redirect("/onboarding/conclusion");
	}

	return (
		<>
			<div className="flex flex-row w-full gap-4 h-screen items-center">
				<div className="w-full flex flex-col gap-8 items-start justify-center p-8 lg:p-16">
					<div className="flex flex-col gap-2 items-start w-full">
						<h1 className="text-3xl font-bold">
							Your first monitor
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Everything starts with a monitor. They keep track of every single ping made to your service and track status codes, latency, headers, responses and more.
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center justify-between w-full">
						<OnboardingMonitorForm workspace={workspace} />
					</div>
				</div>
				<Image src="/onboarding/intro.png" alt="Onboarding" width={1990} height={1860} className="hidden md:block w-full h-11/12 object-cover object-left rounded-l-lg border" />
			</div>
		</>
	)
}