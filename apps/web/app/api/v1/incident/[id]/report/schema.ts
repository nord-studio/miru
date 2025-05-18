import { z } from "zod";

export const incidentReportSchema = z.object({
	status: z.string().nonempty(),
	message: z.string().nonempty(),
})