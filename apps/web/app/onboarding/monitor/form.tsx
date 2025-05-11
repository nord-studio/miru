"use client"

import OnboardingCreateMonitor from "@/app/onboarding/monitor/create";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/types/workspace";
import { ArrowLeft, ArrowRightIcon, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function OnboardingMonitorForm({ workspace }: { workspace: Workspace }) {
	const [open, setOpen] = React.useState(false);
	const [hasOpened, setHasOpened] = React.useState(false);

	function openModal() {
		setOpen(!open);
		setHasOpened(!hasOpened);
	}

	return (
		<>
			<OnboardingCreateMonitor open={open} setOpen={setOpen} workspace={workspace} />
			{hasOpened ? (
				<>
					<Link href="/onboarding/workspace">
						<Button variant="outline">
							<ArrowLeft /> Back
						</Button>
					</Link>
					<Link href="/onboarding/page">
						<Button>
							Next <ArrowRightIcon />
						</Button>
					</Link>
				</>
			) : (
				<>
					<Link href="/onboarding/page">
						<Button variant="outline">
							Skip <ArrowRightIcon />
						</Button>
					</Link>
					<Button onClick={() => openModal()}>
						Create Monitor
						<Plus />
					</Button>
				</>
			)}
		</>
	)
}