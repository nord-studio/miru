type MiruConfig = {
	email: {
		enabled: boolean;
		verification: boolean;
	},
	incidents: {
		auto: {
			enabled: boolean;
		}
	},
	storage: {
		max_size: number;
	}
}

export async function getPath() {
	const path = await import("path");

	if (process.env.APP_ENV === "development") {
		return path.join(process.cwd(), "..", "..", "config.toml");
	} else {
		return path.join(process.cwd(), "config.toml")
	}
}

export async function parseConfig() {
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
				enabled: false
			}
		},
		storage: {
			max_size: 12582912 // 12MB
		}
	};

	try {
		config = parse(contents) as MiruConfig;
		defaults = false;
	} catch (error) { }

	return { config, defaults };
}

const { memoize } = await import("es-toolkit");
export const getConfig = memoize(parseConfig);


