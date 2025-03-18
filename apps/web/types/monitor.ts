export type Monitor = {
	id: string;
	name: string;
	type: "http" | "tcp";
	url: string;
	interval: number;
	createdAt: Date;
	updatedAt: Date;
	uptime: number | null;
}
