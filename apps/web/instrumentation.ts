declare global {
	var secrets: {
		url?: string;
	}
}

export function register() {
	global.secrets = {};

	global.secrets.url = process.env.APP_URL;

	console.log("APP_URL:", global.secrets.url);
}