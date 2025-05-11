import React from "react";
import OnboardingWorkspaceForm from "@/app/onboarding/workspace/form";
import { getFirstWorkspace } from "@/app/onboarding/actions";
import Image from "next/image";

export default async function OnboardingWorkspacePage() {
	const workspace = await getFirstWorkspace();

	return (
		<>
			<div className="flex flex-row w-full gap-4 h-screen items-center">
				<div className="w-full flex flex-col gap-8 items-start justify-center p-8 lg:p-16">
					<div className="flex flex-col gap-2 items-start w-full">
						<h1 className="text-3xl font-bold">
							Your first workspace!
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Let&apos;s configure your first workspace. A workspace is where monitors, incidents, status pages and more live.
							You can change the name and slug below:
						</p>
					</div>
					<OnboardingWorkspaceForm workspace={workspace} />
				</div >
				<Image src="/onboarding/intro.png" alt="Onboarding" width={1990} height={1860} className="hidden md:block w-full h-11/12 object-cover object-left rounded-l-lg border" />
			</div>
		</>
	)
}