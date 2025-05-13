import { z } from "zod";

export const monitorSchema = z.object({
	name: z.string().nonempty(),
	type: z.enum(["http", "tcp"]),
	url: z.string().nonempty(),
	interval: z.number().refine(value => [1, 5, 10, 30, 60].includes(value), {
		message: "Interval must be one of 1, 5, 10, 30, 60"
	})
});