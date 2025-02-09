import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
	return (
		<main className="max-w-[800px] flex flex-col items-center justify-center h-screen mx-auto gap-6">
			<div className="flex flex-col items-center">
				<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
					Welcome to Iris!
				</h1>
				<p>
					It looks like you haven't setup a status page yet. Navigate
					to the dashboard to get started.
				</p>
			</div>
			<Link href="/dashboard">
				<Button>Dashboard</Button>
			</Link>
		</main>
	);
}
