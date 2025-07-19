import { IncidentReportStatus } from "@miru/types";
import { z } from "zod";

export const createIncidentSchema = z.object({
	monitorIds: z.array(z.string()).min(1),
	title: z.string().nonempty(),
	message: z.string().nonempty(),
	status: z.custom<IncidentReportStatus>(async (status) => {
		return Object.values(IncidentReportStatus).includes(status as IncidentReportStatus);
	})
});

export const incidentSchema = z.object({
	monitorIds: z.array(z.string()).min(1),
	title: z.string().nonempty(),
});