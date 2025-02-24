import { monitors } from "@/lib/db/schema/monitors";
import { generateId } from "@/lib/utils";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const incidents = pgTable("incidents", {
	/// The unique identifier for the incident
	id: text("id").primaryKey().$defaultFn(generateId),
	/// A list of monitors that are affected by the incident
	monitorIds: text("monitor_ids").notNull().references(() => monitors.id, { onDelete: "cascade" }),
	// The title of the incident
	title: text("title").notNull(),
	/// When the incident was started
	started_at: timestamp("started_at").notNull().defaultNow(),
	/// When the incident was acknowledged
	acknowledged_at: timestamp("acknowledged_at"),
	/// When the incident was resolved
	resolve_at: timestamp("resolve_at"),
	/// If the incident was auto-resolved
	auto_resolved: boolean("auto_resolved").notNull().default(false),
})

export const incident_updates = pgTable("incident_updates", {
	/// The unique identifier for the incident update
	id: text("id").primaryKey().$defaultFn(generateId),
	/// A reference to what incident this update belongs to
	incidentId: text("incident_id").notNull().references(() => incidents.id, { onDelete: "cascade" }),
	/// The message of the incident update
	message: text("message").notNull(),
	/// The status of the incident update
	status: text("status", { enum: ["investigating", "identified", "monitoring", "resolved"] }).notNull(),
	/// When the incident update took place
	timestamp: timestamp("timestamp").notNull().defaultNow(),
})