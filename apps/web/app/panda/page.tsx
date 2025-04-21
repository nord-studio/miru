import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { statusPages } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import Link from "next/link";
import PandaStatusPageDesign from "@/designs/panda";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
	const fresh = await db
		.select()
		.from(user)
		.limit(1)
		.then((res) => res.length === 0);

	if (fresh) {
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
					<Link href="/auth/register?fresh=true">
						<Button>Create Account</Button>
					</Link>
				</main>
			</>
		)
	}

	const statusPage = await db.query.statusPages.findFirst({
		with: {
			statusPageMonitors: {
				with: {
					monitor: true
				}
			}
		},
		where: () => eq(statusPages.root, true)
	});

	if (!statusPage) {
		return (
			<>
				<main className="max-w-[800px] flex flex-col items-center justify-center h-screen mx-auto gap-6">
					<div className="flex flex-col items-center">
						<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
							This is awkward...
						</h1>
						<p>
							A status page hasn&apos;t been setup yet. Please
							check back later.
						</p>
					</div>
				</main>
			</>
		)
	}

	return (
		<>
			<PandaStatusPageDesign page={statusPage} />
		</>
	)
}
