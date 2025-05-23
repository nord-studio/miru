import { incidents } from "@/lib/db/schema";
import { workspaces } from "@/lib/db/schema/workspaces";
import { generateId } from "@/lib/utils";
import { relations } from "drizzle-orm/relations";
import { pgTable, text, timestamp, boolean, varchar, integer, primaryKey, json } from "drizzle-orm/pg-core";
import { statusPageMonitors } from "@/lib/db/schema/status-pages";
import { events } from "@/lib/db/schema/events";

export const monitors = pgTable("monitors", {
	/// The unique identifier for the monitor
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	/// A reference to the workspace this monitor belongs to
	workspaceId: varchar("workspace_id", { length: 16 }).references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
	/// The name of the monitor
	name: text("name").notNull(),
	/// The type of monitor (e.g. HTTP, TCP, etc)
	type: text("type", { enum: ["http", "tcp"] }).notNull(),
	/// The URL to monitor
	url: text("url").notNull(),
	/// The interval in seconds to check the monitor
	interval: integer("interval").notNull(),
	/// When the monitor was created
	createdAt: timestamp("created_at").notNull().defaultNow(),
	/// When the monitor was last updated
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Many (Monitors) to many (Incidents) relationship
export const monitorRelations = relations(monitors, ({ many, one }) => ({
	monitorsToIncidents: many(monitorsToIncidents),
	workspace: one(workspaces, {
		fields: [monitors.workspaceId],
		references: [workspaces.id]
	}),
	statusPageMonitors: many(statusPageMonitors)
}))

// Join table for the many to many relationship between monitors and incidents
export const monitorsToIncidents = pgTable("monitors_to_incidents", {
	monitorId: varchar("monitor_id", { length: 16 }).notNull().references(() => monitors.id, { onDelete: "cascade" }),
	incidentId: varchar("incident_id", { length: 16 }).notNull().references(() => incidents.id, { onDelete: "cascade" }),
}, (t) => [
	primaryKey({ columns: [t.monitorId, t.incidentId] })
])

// Many to many relationship between monitors and incidents
export const monitorsToIncidentsRelations = relations(monitorsToIncidents, ({ one }) => ({
	monitor: one(monitors, {
		fields: [monitorsToIncidents.monitorId],
		references: [monitors.id]
	}),
	incident: one(incidents, {
		fields: [monitorsToIncidents.incidentId],
		references: [incidents.id]
	})
}))

// Join table for the many to many relationship between monitors and events
export const monitorsToEvents = pgTable("monitors_to_events", {
	monitorId: varchar("monitor_id", { length: 16 }).notNull().references(() => monitors.id, { onDelete: "cascade" }),
	eventId: varchar("event_id", { length: 16 }).notNull().references(() => events.id, { onDelete: "cascade" }),
}, (t) => [
	primaryKey({ columns: [t.monitorId, t.eventId] })
]);

// Many to many relationship between monitors and events
export const monitorsToEventsRelations = relations(monitorsToEvents, ({ one }) => ({
	monitor: one(monitors, {
		fields: [monitorsToEvents.monitorId],
		references: [monitors.id]
	}),
	event: one(events, {
		fields: [monitorsToEvents.eventId],
		references: [events.id]
	})
}));

export const pings = pgTable("pings", {
	/// The unique identifier for the ping
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	/// A reference to what monitor this ping belongs to
	monitorId: varchar("monitor_id", { length: 16 }).notNull().references(() => monitors.id, { onDelete: "cascade" }),
	/// The type of the ping (e.g. HTTP, TCP, etc)
	type: text("type", { enum: ["http", "tcp"] }).notNull(),
	/// If the ping was successful
	success: boolean("success").notNull().default(false),
	/// The HTTP status code of the response.
	status: integer("status"),
	/// The latency of the response
	latency: integer("latency").notNull(),
	/// The headers of the response
	headers: json("headers"),
	/// The body of the response
	body: text("body"),
	/// When the ping was created
	createdAt: timestamp("created_at").notNull().defaultNow(),
})