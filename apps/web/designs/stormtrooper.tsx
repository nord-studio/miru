import { Button } from "@/components/ui/button"
import Image from "next/image";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages"
import { StatusBanner } from "@/components/ui/status-banner";
import StatusPageMonitor from "@/components/status-pages/status-monitor";
import { ThemeDropdown } from "@/components/theme/dropdown";
import Color from "color";
import { cn } from "@/lib/utils";

export default function StormtrooperStatusPageDesign({ page }: { page: StatusPageWithMonitorsExtended }) {
	const color = Color(page.brandColor || "#5865F2");
	function isLight() {
		if (page.forcedTheme === "auto") return color.isLight();
		if (page.forcedTheme === "light") return true;
		if (page.forcedTheme === "dark") return false;
		else return color.isLight();
	}

	return (
		<>
			<main className="flex flex-col w-full h-screen gap-0">
				<section className="flex flex-col px-12 pt-12 gap-12 items-center justify-between" style={{ backgroundColor: color.hex() }}>
					<div className="flex h-full w-full flex-col items-start gap-8 max-w-[800px] mx-auto">
						<div className="flex flex-row justify-between gap-2 items-center w-full">
							<div className="flex flex-col gap-2 items-start w-full">
								<div className={cn("hidden", !isLight() && "block")}>
									{page.darkLogo ? (
										<Image
											src={`/api/assets/${page.darkLogo}`}
											alt="Dark Logo"
											width={64}
											height={64}
											className={cn("hidden", !isLight() && "block")}
										/>
									) : (
										<h1 className={cn(
											"text-4xl font-black font-display",
											isLight() ? "text-neutral-900" : "text-neutral-100"
										)}>{page.name}</h1>
									)}
								</div>
								<div className={cn("hidden", isLight() && "block")}>
									{page.logo ? (
										<Image
											src={`/api/assets/${page.logo}`}
											alt="Logo"
											width={64}
											height={64}
											className={cn("hidden", isLight() && "block")}
										/>
									) : (
										<h1 className={cn(
											"text-4xl font-black font-display",
											isLight() ? "text-neutral-900" : "text-neutral-100"
										)}>{page.name}</h1>
									)}
								</div>
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
					</div>
					<div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 rounded-t-2xl max-w-[800px] p-8 shadow-md border-x border-t">
						<StatusBanner />
					</div>
				</section>
				<section className="w-full h-full px-8 pb-8">
					<div className="mx-auto max-w-[800px] w-full h-fit bg-neutral-100 dark:bg-neutral-900 shadow-md px-8 pb-8 pt-2 rounded-b-2xl border-b border-x">
						<div className="flex flex-col h-full w-full gap-8 justify-between">
							<div className="flex flex-col gap-8 items-start w-full">
								{page.statusPageMonitors.map((monitor) => {
									return (
										<StatusPageMonitor monitor={monitor.monitor} key={monitor.id} />
									)
								})}
							</div>
						</div>
					</div>
				</section>
				<section className="flex flex-row gap-2 items-center justify-between w-full max-w-[800px] mx-auto pb-8">
					<ThemeDropdown />
					<p className="text-neutral-500 dark:text-neutral-400">
						Powered by Miru <span></span>
					</p>
				</section>
			</main>
		</>
	)
}