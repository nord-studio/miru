import { IncidentReport } from "@miru/types";

export function getReportStatusLabel(report: IncidentReport) {
	switch (report.status) {
		case "resolved":
			return "Resolved";
		case "investigating":
			return "Investigating";
		case "monitoring":
			return "Monitoring";
		case "identified":
			return "Identified";
		default:
			return report.status.charAt(0).toUpperCase() + report.status.slice(1);
	}
}