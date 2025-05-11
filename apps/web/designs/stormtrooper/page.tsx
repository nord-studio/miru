import { StatusPageWithMonitorsExtended } from "@/types/status-pages"
import { StatusBanner } from "@/components/ui/status-banner";
import StatusPageMonitor from "@/components/status-pages/status-monitor";
import { IncidentWithReportsAndMonitors } from "@/types/incident";
import StormtrooperStatusPageShell from "@/designs/stormtrooper/shell";

export default function StormtrooperStatusPageDesign({ page, incidents }: { page: StatusPageWithMonitorsExtended, incidents: IncidentWithReportsAndMonitors[] }) {
	let variant: "operational" | "degraded" | "down" = "operational";

	const allOpenIncids = incidents.filter((incid) =>
		incid.resolvedAt === null &&
		incid.monitorsToIncidents.some((monitorToIncident) =>
			page.statusPageMonitors.some((monitor) =>
				monitor.monitor.id === monitorToIncident.monitor.id
			)
		)
	);

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
			<StormtrooperStatusPageShell page={page} header={<StatusBanner variant={variant} />}>
				{page.statusPageMonitors.map((monitor) => {
					const incids = incidents.filter((incident) => {
						return incident.monitorsToIncidents.some((monitorToIncident) => {
							return monitorToIncident.monitor.id === monitor.monitor.id;
						});
					});

					return (
						<StatusPageMonitor monitor={monitor.monitor} key={monitor.id} incidents={incids} />
					)
				})}
			</StormtrooperStatusPageShell>
		</>
	)
}