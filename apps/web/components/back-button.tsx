"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ isLight }: { isLight?: boolean }) {
	const router = useRouter();

	if (typeof isLight === "undefined") {
		return (
			<>
				<button
					className="flex flex-row items-center gap-2 text-neutral-400 dark:text-neutral-500 hover:cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
					onClick={router.back}
				>
					<ArrowLeft size={16} />
					<span className="text-lg font-medium">Back</span>
				</button>
			</>
		);
	} else {
		return (
			<>
				<button
					className={cn("flex flex-row items-center gap-2 hover:cursor-pointer transition-colors", isLight ? "text-neutral-900 hover:text-neutral-800" : "text-neutral-100 hover:text-neutral-200")}
					onClick={router.back}
				>
					<ArrowLeft size={16} />
					<span className="text-lg font-medium">Back</span>
				</button>
			</>
		);
	}
}