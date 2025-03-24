declare global {
	// eslint-disable-next-line no-var
	var secrets: {
		domain?: string;
	}
}

export function register() {
	global.secrets = {};

	global.secrets.domain = process.env.NODE_ENV === "development" ? "localhost:3000" : process.env.APP_DOMAIN;

	console.log("APP_DOMAIN:", global.secrets.domain);
}