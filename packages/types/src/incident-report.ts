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