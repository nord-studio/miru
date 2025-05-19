import { Monitor } from "./monitor";

export interface Notification {
	id: string;
	name: string;
	workspaceId: string;
	provider: "slack" | "discord";
	url: string | null;
}

export interface NotificationWithMonitors extends Notification {
	monitors: Monitor[];
}
