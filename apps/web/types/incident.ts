import { IncidentReport } from "@/types/incident-report";
import { Monitor } from "@/types/monitor";

export interface Incident {
	id: string;
	title: string;
	startedAt: Date;
	acknowledgedAt: Date | null;
	resolvedAt: Date | null;
	autoResolved: boolean;
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