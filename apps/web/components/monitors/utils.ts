import { env } from "@/lib/env.mjs";
import TestEndpoint from "@/types/monitor-service/test";

export async function testUrl(method: string, url: string) {
	await fetch(`${env.NEXT_PUBLIC_MONITOR_URL}/test/${method}/${url}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	}).then(async (res) => {
		const json: TestEndpoint = await res.json();
		console.log(json)

		if (json.success === true) {
			return json;
		} else {
			throw new Error(`Couldn't establish a connection to ${url}.`);
		}
	});
}