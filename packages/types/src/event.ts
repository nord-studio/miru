import { Monitor } from "./monitor";

export interface Event {
	id: string;
	title: string;
	message: string;
	updatedAt: Date;
	startsAt: Date;
	duration: number;
	autoComplete: boolean;
	completed: boolean;
}

export type EventWithMonitors = Event & {
	monitors: Monitor[];
}