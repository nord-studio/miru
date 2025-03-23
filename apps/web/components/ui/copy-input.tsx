"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

export function CopyToClipboardInput({ content }: { content: string }) {
	const [copied, setCopied] = useState(false)

	const copyToClipboard = () => {
		navigator.clipboard.writeText(content)
		setCopied(true)
		toast.info("Copied to clipboard")
		setTimeout(() => setCopied(false), 1000)
	}

	return (
		<div className="flex w-full items-center space-x-2">
			<Input
				type="text"
				value={content}
				readOnly
				onClick={copyToClipboard}
				className="cursor-pointer bg-neutral-200 dark:bg-neutral-900 focus-visible:ring-offset-0"
				tabIndex={-1}
			/>
			<Button size="icon" onClick={copyToClipboard} variant="outline" className="h-10 w-10" type="button">
				{copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
			</Button>
		</div>
	)
}

