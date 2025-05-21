"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
	const router = useRouter();
	return (
		<>
			<main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
				<h1 className="text-3xl font-black">( : ౦ ‸ ౦ : )</h1>
				<h2 className="text-lg">
					We&apos;re sorry, but you don&apos;t have access to this page.
				</h2>
				<Button variant="outline" onClick={() => router.back()}>
					Go Back
				</Button>
			</main>
		</>
	);
}
