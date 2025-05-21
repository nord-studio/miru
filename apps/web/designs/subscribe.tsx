import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Atom, RssIcon } from "lucide-react"
import Link from "next/link"


export default function SubscribeDropdown({ children }: { children: React.ReactNode }) {
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
				<DropdownMenuContent>
					<Link href="/feed/rss" target="_blank">
						<DropdownMenuItem>
							<RssIcon />
							RSS
						</DropdownMenuItem>
					</Link>
					<Link href="/feed/atom" target="_blank">
						<DropdownMenuItem>
							<Atom />
							Atom
						</DropdownMenuItem>
					</Link>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}