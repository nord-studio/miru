import { BaseResponsePartialMessage } from "@/types/response";

export interface Monitor {
	id: string;
	workspaceId: string;
	name: string;
	type: "http" | "tcp";
	url: string;
	interval: 1 | 5 | 10 | 30 | 60;
	createdAt: Date;
	updatedAt: Date;
}

export interface RouteWithMonitor extends BaseResponsePartialMessage {
	monitor?: Monitor;
}

export interface RouteWithMultipleMonitors extends BaseResponsePartialMessage {
	monitors?: Monitor[];
}