"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RootPage() {
	return (
		<>
			<main className="max-w-[800px] flex flex-col items-center justify-center h-screen mx-auto gap-8">
				<div className="flex flex-col items-center gap-4">
					<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
						(・_・ヾ)
					</h1>
					<h1 className="text-3xl font-display font-black text-neutral-900 dark:text-neutral-100">
						Uh... Hi?
					</h1>
					<p className="text-center text-neutral-500 dark:text-neutral-400">
						This page doesn&apos;t do anything, and it will never do anything. It is used as a fallback for if anything breaks. <br />
						But the fact you are seeing this means that something <i>did</i> break...
					</p>
				</div>
				<div className="flex flex-row gap-3 items-center">
					<Button variant="outline" onClick={() => window.location.reload()}>
						Refresh
					</Button>
					<Link href="https://github.com/nord-studio/miru/issues/new">
						<Button>
							Report an Issue
						</Button>
					</Link>
				</div>
			</main>
		</>
	)
}