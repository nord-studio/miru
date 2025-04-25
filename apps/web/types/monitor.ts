export type Monitor = {
	id: string;
	workspaceId: string;
	name: string;
	type: "http" | "tcp";
	url: string;
	interval: number;
	createdAt: Date;
	updatedAt: Date;
}

export type MonitorWithUptime = Monitor & {
	uptime: number;
};