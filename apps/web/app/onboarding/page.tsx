import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function OnboardingPage() {
	return (
		<div className="flex flex-row w-full gap-4 h-screen items-center">
			<div className="w-full flex flex-col gap-8 items-center justify-center p-16">
				<div className="flex flex-col gap-2 items-start w-full">
					<h1 className="text-3xl font-bold">
						Welcome to Miru!
					</h1>
					<p className="text-neutral-500 dark:text-neutral-400">
						Welcome to your new Miru instance! This onboarding process will help you set up your instance and get started with Miru.
					</p>
				</div>
				<div className="flex flex-row gap-2 items-center justify-start w-full">
					<Link href="/auth/register">
						<Button variant="outline">
							Skip
						</Button>
					</Link>
					<Link href="/onboarding/introduction">
						<Button>
							Continue
						</Button>
					</Link>
				</div>
			</div>
			<Image src="/onboarding/welcome.png" alt="Onboarding" width={1990} height={1860} className="hidden md:block w-full h-11/12 object-cover object-left rounded-l-lg border" />
		</div>
	)
}