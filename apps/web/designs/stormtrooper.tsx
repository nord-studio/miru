import { Button } from "@/components/ui/button"
import Image from "next/image";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages"
import { MonoStatusBanner } from "@/components/ui/status-banner";
import StatusPageMonitor from "@/components/status-pages/status-monitor";
import { ThemeDropdown } from "@/components/theme/dropdown";
import Color from "color";

export default function StormtrooperStatusPageDesign({ page }: { page: StatusPageWithMonitorsExtended }) {
	const color = Color(page.brandColor || "#5865F2");

	return (
		<>
			<main className="flex flex-col w-full h-screen gap-8">
				<section className={`border-b py-10 px-8`} style={{ backgroundColor: color.hex() }}>
					<div className="flex h-full w-full flex-col gap-8 max-w-[800px] mx-auto">
						<div className="flex flex-row justify-between gap-2 items-center w-full">
							<div className="flex flex-col gap-2 items-start w-full">
								{page.logo ? (
									<Image
										src={`/api/assets/${page.logo}`}
										alt="Logo"
										width={64}
										height={64}
									/>
								) : (
									<h1 className="text-4xl font-black font-display">{page.name}</h1>
								)}
							</div>
							<div className="flex flex-row gap-2 items-center">
								<Button>
									Report an Issue
								</Button>
								<Button className="invert">
									Subscribe
								</Button>
							</div>
						</div>
						<MonoStatusBanner isLight={color.isLight()} />
					</div>
				</section>
				<section className="w-full h-full px-8 pb-8">
					<div className="mx-auto max-w-[800px] w-full h-full">
						<div className="flex flex-col h-full w-full gap-8 justify-between">
							<div className="flex flex-col gap-8 items-start w-full">
								{page.statusPageMonitors.map((monitor) => {
									return (
										<StatusPageMonitor monitor={monitor.monitor} key={monitor.id} />
									)
								})}
							</div>
							<div className="flex flex-row gap-2 items-center justify-between w-full">
								<ThemeDropdown />
								<p className="text-neutral-500 dark:text-neutral-400">
									Powered by Miru <span></span>
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}