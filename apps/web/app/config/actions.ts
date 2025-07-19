"use server";

import { auth } from "@/lib/auth";
import { getPath } from "@/lib/config";
import { actionClient } from "@/lib/safe-action";
import { MiruConfig } from "@miru/types";
import { stringify } from "@std/toml";
import { flattenValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";
import { writeFile } from "fs/promises";

export const updateConfig = actionClient
	.inputSchema(z.custom<MiruConfig>(), {
		handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
	})
	.outputSchema(z.object({
		error: z.boolean(),
		message: z.string()
	})).action(async ({ parsedInput: config }) => {
		const user = await auth.api.getSession({
			headers: await headers()
		});

		if (!user || !user.user) {
			return {
				error: true,
				message: "Unauthorized"
			}
		}

		if (!user.user.admin) {
			return {
				error: true,
				message: "Unauthorized"
			}
		}

		const newConfig = stringify(config);

		const configPath = await getPath();

		try {
			await writeFile(configPath, newConfig);
		} catch (error) {
			return {
				error: true,
				message: `Failed to write config: ${error instanceof Error ? error.message : String(error)}`
			};
		}

		return {
			error: false,
			message: "Config updated successfully"
		}
	})