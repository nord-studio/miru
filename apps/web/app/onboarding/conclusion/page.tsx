import { Button } from "@/components/ui/button";
import { Book, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function OnboardingConclusionPage() {
	return (
		<div className="flex flex-row w-full gap-4 h-screen items-center">
			<div className="w-full flex flex-col gap-8 items-center justify-center p-16">
				<div className="flex flex-col gap-2 items-start w-full">
					<h1 className="text-3xl font-bold">
						That&apos;s all folks!
					</h1>
					<p className="text-neutral-500 dark:text-neutral-400">
						Congratulations! You&apos;ve completed the onboarding process. <br /> Take a look at the documentation to learn more, or dive right in and start using Miru!
					</p>
				</div>
				<div className="flex flex-row gap-2 items-center justify-start w-full">
					<Link href="https://miru.nordstud.io/docs" target="_blank" rel="noopener noreferrer">
						<Button variant="outline">
							Docs <Book />
						</Button>
					</Link>
					<Link href="/admin">
						<Button>
							Complete <Check />
						</Button>
					</Link>
				</div>
			</div>
			<Image src="/onboarding/welcome.png" alt="Onboarding" width={1990} height={1860} className="hidden md:block w-full h-11/12 object-cover object-left rounded-l-lg border" />
		</div>
	)
}