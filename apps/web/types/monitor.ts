export type Monitor = {
	id: string;
	name: string;
	type: string;
	url: string;
	interval: number;
	createdAt: Date;
	updatedAt: Date;
	uptime: number | null;
}
