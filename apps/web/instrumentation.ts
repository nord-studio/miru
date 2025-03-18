declare global {
	var secrets: {
		url?: string;
	}
}

export function register() {
	global.secrets = {};

	global.secrets.url = process.env.APP_URL;

	console.log("Secrets loaded!");
}