'use client'

import { Button } from "@/components/ui/button"
import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex min-h-screen w-full flex-col items-center  justify-center gap-4">
			<h1 className="text-3xl font-black">(╥﹏╥)</h1>
			<h2 className="text-center text-lg text-neutral-500 dark:text-neutral-400">
				Oops! Something went wrong.
			</h2>
			<code className="overflow-scroll max-w-2xl rounded-lg bg-neutral-200 p-2 text-sm dark:bg-neutral-800">
				{error.message}
			</code>
			<Button variant="outline" onClick={() => reset()}>
				Try again
			</Button>
		</main>
	)
}