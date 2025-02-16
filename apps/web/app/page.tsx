import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import Link from "next/link";

export default async function Home() {
	const fresh = await db
		.select()
		.from(user)
		.limit(1)
		.then((res) => res.length === 0);

	return (
		<main className="max-w-[800px] flex flex-col items-center justify-center h-screen mx-auto gap-6">
			{fresh ? (
				<>
					<div className="flex flex-col items-center">
						<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
							Welcome to Iris!
						</h1>
						<p>
							It looks like you haven&apos;t setup Iris yet. Click
							the button below to get started.
						</p>
					</div>
					<Link href="/auth/register?fresh=true">
						<Button>Create Account</Button>
					</Link>
				</>
			) : (
				<>
					<div className="flex flex-col items-center">
						<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
							This is awkward...
						</h1>
						<p>
							A status page hasn&apos;t been setup yet. Please
							check back later.
						</p>
					</div>
				</>
			)}
		</main>
	);
}
