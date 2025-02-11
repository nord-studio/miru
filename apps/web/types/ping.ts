export type ping = {
	id: string;
	monitorId: string;
	status: boolean;
	latency: {
		dns: number;
		tcp: number;
		tls: number;
		ttfb: number;
		transfer: number;
	},
	headers?: {
		[key: string]: string;
	},
	createdAt: number;
}