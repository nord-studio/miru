export default interface TestEndpoint {
	status: number;
	latency: number;
	headers: { [key: string]: string };
}