import { Monitor } from "@/types/monitor";

export interface Event {
	id: string;
	title: string;
	message: string;
	updatedAt: Date;
	startsAt: Date;
	duration: number;
	autoComplete: boolean;
}

export type EventWithMonitors = Event & {
	monitors: Monitor[];
}