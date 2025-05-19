import { Monitor } from "@miru/types";
import { BaseResponsePartialMessage } from "@/types/response";

export interface Incident {
	id: string;
	title: string;
	startedAt: Date;
	acknowledgedAt: Date | null;
	resolvedAt: Date | null;
	autoResolved: boolean;
}

export enum IncidentReportStatus {
	INVESTIGATING = "investigating",
	IDENTIFIED = "identified",
	MONITORING = "monitoring",
	RESOLVED = "resolved",
}

export interface IncidentReport {
	id: string;
	incidentId: string;
	message: string;
	status: IncidentReportStatus;
	timestamp: Date;
}

// Incidents
export type IncidentWithMonitors = Incident & {
	monitors: Monitor[];
};

export interface RouteWithIncident extends BaseResponsePartialMessage {
	incident?: Incident;
}

// Multiple incidents with monitors  adfasdfasdfasdf
export interface RouteWithIncidentsAndMonitors extends BaseResponsePartialMessage {
	incidents?: IncidentWithMonitors[];
}

// Single incident with monitors
export interface RouteWithIncidentAndMonitors extends BaseResponsePartialMessage {
	incident?: IncidentWithMonitors[];
}

export interface RouteWithIncidentAndReport extends BaseResponsePartialMessage {
	incident?: Incident;
	report?: IncidentReport;
}

// Incident Reports
export interface RouteWithIncidentReport extends BaseResponsePartialMessage {
	report?: IncidentReport;
}

export interface RouteWithIncidentReports extends BaseResponsePartialMessage {
	reports?: IncidentReport[];
}