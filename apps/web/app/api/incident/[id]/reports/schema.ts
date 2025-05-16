import { z } from "zod";

export const createIncidentReportSchema = z.object({
	incidentId: z.string().nonempty(),
	status: z.string().nonempty(),
	message: z.string().nonempty(),
});

export const incidentReportSchema = z.object({
	id: z.string().nonempty(),
	status: z.string().nonempty(),
	message: z.string().nonempty(),
})