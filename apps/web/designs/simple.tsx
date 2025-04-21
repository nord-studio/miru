import { Button } from "@/components/ui/button"
import Image from "next/image";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages"
import { StatusBanner } from "@/components/ui/status-banner";
import StatusPageMonitor from "@/components/status-pages/status-monitor";
import { ThemeDropdown } from "@/components/theme/dropdown";
import { cn } from "@/lib/utils";

export default function SimpleStatusPageDesign({ page }: { page: StatusPageWithMonitorsExtended }) {
	const domain = process.env.APP_DOMAIN || "localhost:3000";

	return (
		<>
			<main className="flex flex-col gap-16 items-center justify-center h-screen mx-auto p-8 w-full max-w-[800px]">
				<div className="flex h-full w-full flex-1 flex-col gap-8">
					<div className="flex flex-row justify-between gap-2 items-center w-full">
						<div className="flex flex-col gap-2 items-start w-full">
							{page.logo ? (
								<>
									<Image
										src={`/api/assets/${page.logo}`}
										alt="Logo"
										width={64}
										height={64}
										className={cn(page.darkLogo && "block dark:hidden")}
									/>
									{page.darkLogo && (
										<Image
											src={`/api/assets/${page.darkLogo}`}
											alt="Dark Logo"
											width={64}
											height={64}
											className="hidden dark:block"
										/>
									)}
								</>
							) : (
								<h1 className="text-4xl font-black font-display">{page.name}</h1>
							)}
						</div>
						<div className="flex flex-row gap-2 items-center">
							<Button variant="secondary">
								Report an Issue
							</Button>
							<Button>
								Subscribe
							</Button>
						</div>
					</div>
					<StatusBanner />
					<div className="flex flex-col gap-8 items-start w-full">
						{page.statusPageMonitors.map((monitor) => {
							return (
								<StatusPageMonitor monitor={monitor.monitor} key={monitor.id} />
							)
						})}
					</div>
				</div>
				<div className="flex flex-row gap-2 items-center justify-between w-full">
					<ThemeDropdown />
					<p className="text-neutral-500 dark:text-neutral-400">
						Powered by Miru <span></span>
					</p>
				</div>
			</main>
		</>
	)
}