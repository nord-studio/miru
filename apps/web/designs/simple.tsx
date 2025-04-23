import { Button } from "@/components/ui/button"
import Image from "next/image";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages"
import { StatusBanner } from "@/components/ui/status-banner";
import StatusPageMonitor from "@/components/status-pages/status-monitor";
import { ThemeDropdown } from "@/components/theme/dropdown";
import { cn } from "@/lib/utils";
import { IncidentWithReportsAndMonitors } from "@/types/incident";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bell, Megaphone, Menu } from "lucide-react";

export default function SimpleStatusPageDesign({ page, incidents }: { page: StatusPageWithMonitorsExtended, incidents: IncidentWithReportsAndMonitors[] }) {
	let variant: "operational" | "degraded" | "down" = "operational";

	const allOpenIncids = incidents.filter((incid) => incid.resolved_at === null);

	// Go through the list of incidents and get ALL the monitors that are in the incidents, if ALL the monitors in the status page have an open incident, set the variant to "down"
	if (allOpenIncids.length > 0) {
		const allIncidents = page.statusPageMonitors.every((monitor) => {
			return allOpenIncids.some((incident) => {
				return incident.monitorsToIncidents.some((monitorToIncident) => {
					return monitor.monitor.id === monitorToIncident.monitor.id;
				});
			});
		});

		if (allIncidents) {
			variant = "down";
		} else {
			variant = "degraded";
		}
	}

	return (
		<>
			<main className="flex flex-col gap-16 items-center justify-center h-screen mx-auto py-8 px-4 sm:px-8 w-full max-w-[800px]">
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
						<div className="flex-row gap-2 items-center hidden sm:flex">
							<Tooltip>
								<TooltipContent>
									Coming Soon
								</TooltipContent>
								<TooltipTrigger asChild>
									<Button variant="outline">
										Report an Issue
									</Button>
								</TooltipTrigger>
							</Tooltip>
							<Tooltip>
								<TooltipContent>
									Coming Soon
								</TooltipContent>
								<TooltipTrigger asChild>
									<Button>
										<Bell />Subscribe
									</Button>
								</TooltipTrigger>
							</Tooltip>
						</div>
						<div className="flex-row gap-2 items-center flex sm:hidden">
							<Button variant="outline" size="icon">
								<Menu />
							</Button>
						</div>
					</div>
					<StatusBanner variant={variant} />
					<div className="flex flex-col gap-8 items-start w-full">
						{page.statusPageMonitors.map((monitor) => {
							const incids = incidents.filter((incident) => {
								return incident.monitorsToIncidents.some((monitorToIncident) => {
									return monitorToIncident.monitor.id === monitor.monitor.id;
								});
							});

							return (
								<StatusPageMonitor
									monitor={monitor.monitor}
									key={monitor.id}
									incidents={incids}
								/>
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