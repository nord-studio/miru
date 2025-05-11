import { ButtonCards, ButtonCard } from "@/components/ui/button-cards"
import { Star, Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image"
import Link from "next/link";

export default async function IntroductionPage() {
	return (
		<div className="flex flex-row w-full gap-4 h-screen items-center">
			<div className="w-full flex flex-col gap-8 items-start justify-center p-8 lg:p-16">
				<div className="flex flex-col gap-2 items-start w-full">
					<h1 className="text-3xl font-bold">
						A quick word
					</h1>
					<p className="text-neutral-500 dark:text-neutral-400">
						Miru is an open-source project and is maintained by a small team of developers at Nord Studio. <br /><br /> If you like Miru and
						want to support us, please consider giving us a star on GitHub or sponsoring us! It would mean the world to us.
					</p>
				</div>
				<div className="flex flex-row gap-2 items-center w-full">
					<ButtonCards>
						<ButtonCard
							icon={<Star />}
							title="Star us!"
							description="Give the repo a star to show your support!"
							href="https://github.com/nord-studio/miru"
						/>
						<ButtonCard
							icon={<Heart />}
							title="Sponsor us!"
							description="Sponsor us on GitHub to help us keep the lights on."
							href="https://github.com/sponsors/tygrdotdev"
						/>
					</ButtonCards>
				</div>
				<div className="flex flex-row gap-2 items-center justify-between w-full">
					<Link href="/onboarding">
						<Button variant="outline">
							<ArrowLeft /> Back
						</Button>
					</Link>
					<Link href="/onboarding/register">
						<Button>
							Next <ArrowRight />
						</Button>
					</Link>
				</div>
			</div>
			<Image src="/onboarding/intro.png" alt="Onboarding" width={1990} height={1860} className="hidden md:block w-full h-11/12 object-cover object-left rounded-l-lg border" />
		</div>
	)
}