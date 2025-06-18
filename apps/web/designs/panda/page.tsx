import { StatusPageWithMonitorsExtended } from "@miru/types"
import { MonoStatusBanner } from "@/components/ui/status-banner";
import StatusPageMonitor from "@/components/status-pages/status-monitor";
import Color from "color";
import { IncidentWithReportsAndMonitors } from "@miru/types";
import PandaStatusPageShell from "@/designs/panda/shell";
import { EventWithMonitors } from "@miru/types";

export default function PandaStatusPageDesign({ page, incidents, events }: { page: StatusPageWithMonitorsExtended, incidents: IncidentWithReportsAndMonitors[], events: EventWithMonitors[] }) {
	let variant: "operational" | "degraded" | "down" | "maintenance" = "operational";

	const allIncids = incidents.filter((incid) =>
		incid.monitors.some((incidMonitor) =>
			page.statusPageMonitors.some((monitor) =>
				monitor.monitor.id === incidMonitor.id
			)
		)
	);

	const allOpenIncids = allIncids.filter((incid) => incid.resolvedAt === null);

	const allEvents = events.filter((event) => {
		return event.monitors.some((monitor) => {
			return page.statusPageMonitors.some((pageMonitor) => {
				return pageMonitor.monitor.id === monitor.id;
			});
		});
	});

	// If ALL monitors on the status page have an open incident, set the variant to "down"
	// Otherwise, if at least one monitor has an open incident, set the variant to "degraded"
	if (allOpenIncids.length > 0) {
		const allIncidents = page.statusPageMonitors.every((pageMonitor) => {
			return allOpenIncids.some((incident) => {
				return incident.monitors.some((monitor) => {
					return pageMonitor.monitor.id === monitor.id
				});
			});
		});

		if (allIncidents) {
			variant = "down";
		} else {
			variant = "degraded";
		}
	}

	// If there are events in progress, set the variant to "maintenance"
	if (allEvents.length > 0) {
		const eventInProgress = allEvents.every((event) => {
			const endsAt = event.duration ? new Date(event.startsAt.getTime() + event.duration * 60 * 1000) : null;
			return event.startsAt <= new Date() && (!endsAt || endsAt >= new Date());
		});

		if (eventInProgress) {
			variant = "maintenance";
		}
	}

	const color = Color(page.brandColor || "#5865F2");
	function isLight() {
		if (page.forcedTheme === "auto") return color.isLight();
		if (page.forcedTheme === "light") return true;
		if (page.forcedTheme === "dark") return false;
		else return color.isLight();
	}

	return (
		<>
			<PandaStatusPageShell page={page} header={<MonoStatusBanner isLight={isLight()} variant={variant} />}>
				{page.statusPageMonitors.map((pageMonitor) => {
					const incids = incidents.filter((incident) => {
						return incident.monitors.some((monitor) => {
							return monitor.id === pageMonitor.monitor.id;
						});
					});

					const evnts = allEvents.filter((event) => {
						return event.monitors.some((monitor) => {
							return monitor.id === pageMonitor.monitor.id;
						});
					})

					return (
						<StatusPageMonitor monitor={pageMonitor.monitor} key={pageMonitor.id} incidents={incids} events={evnts} />
					)
				})}
			</PandaStatusPageShell>
		</>
	)
}