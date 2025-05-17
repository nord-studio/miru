import { z } from "zod";

export const pageSchema = z.object({
	id: z.string().optional(),
	workspaceId: z.string(),
	name: z.string(),
	enabled: z.boolean().default(true),
	root: z.boolean().default(false),
	domain: z.string().optional(),
	monitorIds: z.array(z.string()),
	description: z.string().optional(),
	logo: z.string().optional(),
	darkLogo: z.string().optional(),
	favicon: z.string().optional(),
	brandColor: z.string().optional(),
	design: z.enum(["simple", "panda", "stormtrooper"]).default("simple"),
	forcedTheme: z.enum(["auto", "light", "dark"]).default("auto"),
})