import { Event } from "@/types/event";
import { Incident } from "@/types/incident";

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

export interface StatusDayBlock {
	date: Date;
	totalPings: number;
	failedPings: number;
	incidents: Incident[];
	events: Event[];
	downtime: number;
}