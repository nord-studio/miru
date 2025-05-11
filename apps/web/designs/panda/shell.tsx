import { Button } from "@/components/ui/button"
import Image from "next/image";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages"
import { ThemeDropdown } from "@/components/theme/dropdown";
import Color from "color";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export default function PandaStatusPageShell({ page, header, children }: { page: StatusPageWithMonitorsExtended, header: React.ReactNode, children: React.ReactNode }) {
	const color = Color(page.brandColor || "#5865F2");
	function isLight() {
		if (page.forcedTheme === "auto") return color.isLight();
		if (page.forcedTheme === "light") return true;
		if (page.forcedTheme === "dark") return false;
		else return color.isLight();
	}

	return (
		<main className="flex flex-col w-full h-screen gap-8">
			<section className={`border-b py-10 px-4 sm:px-8`} style={{ backgroundColor: color.hex() }}>
				<div className="flex h-full w-full flex-col gap-8 max-w-[800px] mx-auto">
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
						<div className="xs:flex hidden flex-row gap-2 items-center">
							<Button variant="link" className={cn(isLight() ? "text-neutral-900" : "text-neutral-100")}>
								Report an Issue
							</Button>
							<Button variant="outline" className={cn("bg-input/30 dark border-input hover:bg-input/60 dark:hover:bg-input/60", isLight() ? "text-neutral-900 hover:text-neutral-900" : "text-neutral-100")}>
								Subscribe
							</Button>
						</div>
						<div className="flex-row gap-2 items-center flex xs:hidden">
							<Button size="icon" variant="outline" className="bg-input/30 dark border-input hover:bg-input/50">
								<Menu className={cn(isLight() ? "text-neutral-900" : "text-neutral-100")} />
							</Button>
						</div>
					</div>
					{header}
				</div>
			</section>
			<section className="w-full h-full px-4 sm:px-8 pb-8">
				<div className="mx-auto max-w-[800px] w-full h-full">
					<div className="flex flex-col h-full w-full gap-8 justify-between">
						<div className="flex flex-col gap-8 items-start w-full">
							{children}
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
	)
}