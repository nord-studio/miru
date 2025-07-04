import { Button } from "@/components/ui/button"
import Image from "next/image";
import { StatusPageWithMonitorsExtended } from "@miru/types"
import { ThemeDropdown } from "@/components/theme/dropdown";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Menu } from "lucide-react";
import SubscribeDropdown from "@/designs/subscribe";

export default function SimpleStatusPageShell({ page, header, children }: { page: StatusPageWithMonitorsExtended, header: React.ReactNode, children: React.ReactNode }) {
	return (
		<>
			<main className="flex flex-col gap-16 items-center justify-center h-screen mx-auto py-8 px-4 sm:px-8 w-full max-w-[800px]">
				<div className="flex h-full w-full flex-1 flex-col gap-8">
					<div className="flex flex-row justify-between gap-2 items-center w-full">
						<div className="flex flex-col gap-2 items-start w-full">
							{page.logo ? (
								<>
									<Image
										src={`/api/v1/assets/${page.logo}`}
										alt="Logo"
										width={180}
										height={64}
										className={cn(page.darkLogo && "block dark:hidden w-40 h-12 object-left object-contain")}
									/>
									{page.darkLogo && (
										<Image
											src={`/api/v1/assets/${page.darkLogo}`}
											alt="Dark Logo"
											width={180}
											height={64}
											className="hidden dark:block w-40 h-12 object-left object-contain"
										/>
									)}
								</>
							) : (
								<h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display">{page.name}</h1>
							)}
						</div>
						<div className="flex-row gap-2 items-center hidden xs:flex">
							<Button variant="outline">
								Report an Issue
							</Button>
							<SubscribeDropdown>
								<Button>
									Subscribe
								</Button>
							</SubscribeDropdown>
						</div>
						<div className="flex-row gap-2 items-center flex xs:hidden">
							<Button variant="outline" size="icon">
								<Menu />
							</Button>
						</div>
					</div>
					{header}
					<div className="flex flex-col gap-8 items-start w-full">
						{children}
					</div>
				</div>
				<div className="flex flex-row gap-2 items-center justify-between w-full">
					<ThemeDropdown />
					<p className="text-neutral-500 dark:text-neutral-400">
						Powered by Miru
					</p>
				</div>
			</main>
		</>
	)
}