"use server"

export default interface TestEndpoint {
	latency: number,
	success: boolean,
}

export async function testUrl(method: string, url: string) {
	await fetch(`${process.env.MONITOR_URL}/test/${method}/${url}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	}).then(async (res) => {
		const json: TestEndpoint = await res.json();

		if (json.success === true) {
			return json;
		} else {
			throw new Error(`Couldn't establish a connection to ${url}.`);
		}
	});
}