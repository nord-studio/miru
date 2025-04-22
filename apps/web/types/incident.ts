import { IncidentReport } from "@/types/incident-report";
import { Monitor } from "@/types/monitor";

export interface Incident {
	id: string;
	title: string;
	started_at: Date;
	acknowledged_at: Date | null;
	resolved_at: Date | null;
	auto_resolved: boolean;
}

export type IncidentWithMonitor = Incident & {
	monitors: Monitor[];
};

export interface IncidentWithReports extends Incident {
	reports: IncidentReport[];
}

export interface IncidentWithReportsAndMonitors extends Incident {
	monitorsToIncidents: {
		monitor: Monitor;
	}[];
	reports: IncidentReport[];
}