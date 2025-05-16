import { Monitor } from "@/types/monitor";

export interface Notification {
	id: string;
	name: string;
	workspaceId: string;
	provider: "email" | "slack" | "discord";
	email: string | null;
	url: string | null;
}

export interface NotificationWithMonitors extends Notification {
	monitors: Monitor[];
}
