import RegisterForm from "@/components/auth/forms/register";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import Image from "next/image";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function OnboardingRegisterPage() {
	const fresh = await db
		.select()
		.from(user)
		.limit(1)
		.then((res) => res.length === 0);

	if (!fresh) {
		return redirect("/admin");
	}

	return (
		<>
			<div className="flex flex-row w-full gap-4 h-screen items-center">
				<div className="w-full flex flex-col gap-8 items-start justify-center p-8 lg:p-16">
					<div className="flex flex-col gap-2 items-start w-full">
						<h1 className="text-3xl font-bold">
							Let&apos;s get to know each other
						</h1>
						<p className="text-neutral-500 dark:text-neutral-400">
							Please start by creating an account. Fill out the form below:
						</p>
					</div>
					<div className="flex flex-row gap-2 items-center w-full">
						<RegisterForm inviteToken={null} onboarding={true} />
					</div>
				</div>
				<Image src="/onboarding/intro.png" alt="Onboarding" width={1990} height={1860} className="hidden md:block w-full h-11/12 object-cover object-left rounded-l-lg border" />
			</div>
		</>
	)
}