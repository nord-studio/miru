import { z } from "zod";

export const pageSchema = z.object({
	name: z.string(),
	enabled: z.boolean().default(true),
	root: z.boolean().default(false),
	domain: z.string().nullish(),
	monitorIds: z.array(z.string()).min(1, "At least one monitor is required"),
	description: z.string().nullish(),
	logo: z.string().nullish(),
	darkLogo: z.string().nullish(),
	favicon: z.string().nullish(),
	brandColor: z.string().nullish(),
	design: z.enum(["simple", "panda", "stormtrooper"]).default("simple"),
	forcedTheme: z.enum(["auto", "light", "dark"]).default("auto"),
})