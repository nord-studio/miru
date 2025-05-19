export type Ping = {
	id: string;
	monitorId: string;
	type: string;
	success: boolean;
	status: number | null;
	latency: number;
	headers: unknown;
	body: string | null;
	createdAt: Date;
}