import { Monitor } from "@/types/monitor";

export interface Incident {
	id: string;
	title: string;
	started_at: Date;
	acknowledged_at: Date | null;
	resolved_at: Date | null;
	auto_resolved: boolean;
}

export type IncidentWithMonitor = Incident & {
	monitors: Omit<Monitor, "uptime">[];
};