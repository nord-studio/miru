import { Monitor } from "@/types/monitor";

export interface StatusPage {
	id: string;
	workspaceId: string;
	name: string;
	enabled: boolean;
	root: boolean;
	domain: string | null;
	description: string | null;
	logo: string | null;
	darkLogo: string | null;
	favicon: string | null;
	brandColor: string | null;
	design: "simple" | "panda" | "stormtrooper";
	forcedTheme: "auto" | "light" | "dark";
}

export interface StatusPageMonitor {
	id: string;
	statusPageId: string;
	monitorId: string;
	order: number;
	showUptime: boolean;
	showPings: boolean;
}

export interface StatusPageWithMonitors extends StatusPage {
	monitors: StatusPageMonitor[];
}

export interface StatusPageMonitorWithMonitor extends StatusPageMonitor {
	monitor: Monitor;
};

export interface StatusPageWithMonitorsExtended extends StatusPage {
	statusPageMonitors: StatusPageMonitorWithMonitor[];
}	