import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import Link from "next/link";

export default async function StatusPageRootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ domain: string }> }) {
	const appDomain = process.env.APP_DOMAIN ?? "localhost:3000";
	const domain = decodeURIComponent((await params).domain);
	const root = domain === appDomain;

	if (root) {
		const fresh = await db
			.select()
			.from(user)
			.limit(1)
			.then((res) => res.length === 0);

		if (fresh) {
			// TODO: Redirect to onboarding
			return (
				<>
					<main className="max-w-[800px] flex flex-col items-center justify-center h-screen mx-auto gap-6">
						<div className="flex flex-col items-center">
							<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
								Welcome to Miru!
							</h1>
							<p>
								It looks like you haven&apos;t setup Miru yet. Click
								the button below to get started.
							</p>
						</div>
						<Link href="/auth/register">
							<Button>Create Account</Button>
						</Link>
					</main>
				</>
			)
		}
	}

	return (
		<>
			{children}
		</>
	)
}