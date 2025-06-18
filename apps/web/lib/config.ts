import { MiruConfig } from "@miru/types";

export async function getPath() {
	const path = await import("path");

	if (process.env.APP_ENV === "development") {
		return path.join(process.cwd(), "..", "..", "config.toml");
	} else {
		return path.join(process.cwd(), "config.toml")
	}
}

export async function getConfig() {
	const { getPath } = await import("@/lib/config");
	const { readFileSync } = await import("fs");
	const { parse } = await import("@std/toml");

	const path = await getPath();
	const contents = readFileSync(path, "utf8");

	let defaults = true;

	// Define default config providing a fallback in case the file is missing or invalid
	let config: MiruConfig = {
		email: {
			enabled: false,
			verification: false
		},
		incidents: {
			auto: {
				enabled: false,
				pings_threshold: 3
			}
		},
		storage: {
			max_size: 12582912 // 12MB
		},
		workspace: {
			creation: false
		},
		users: {
			delete_on_empty: true,
		}
	};

	try {
		config = parse(contents) as MiruConfig;
		defaults = false;
	} catch { }

	return { config, defaults };
}


