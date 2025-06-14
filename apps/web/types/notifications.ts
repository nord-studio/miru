import { Monitor } from "@/types/monitor";

export interface Notification {
	id: string;
	name: string;
	workspaceId: string;
	provider: "slack" | "discord";
	type: "external" | "internal";
	url: string | null;
}

export interface NotificationWithMonitors extends Notification {
	monitors: Monitor[];
}
