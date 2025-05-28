import { monitorsToIncidents } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { relations } from "drizzle-orm/relations";
import { pgTable, text, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";

export const incidents = pgTable("incidents", {
	/// The unique identifier for the incident
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	// The title of the incident
	title: text("title").notNull(),
	/// When the incident was started
	startedAt: timestamp("started_at").notNull().defaultNow(),
	/// When the incident was acknowledged
	acknowledgedAt: timestamp("acknowledged_at"),
	/// When the incident was resolved
	resolvedAt: timestamp("resolved_at"),
	/// If the incident was auto-resolved
	autoResolved: boolean("auto_resolved").notNull().default(false),
});

export const incidentRelations = relations(incidents, ({ many }) => ({
	// Many (Monitors) to many (Incidents) relationship
	monitorsToIncidents: many(monitorsToIncidents),
	// One (Incident) to many (IncidentReports) relationship
	reports: many(incidentReports)
}));

export const incidentReports = pgTable("incident_reports", {
	/// The unique identifier for the incident report
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	/// The incident Id the report belongs to
	incidentId: varchar("incident_id", { length: 16 }).notNull().references(() => incidents.id, { onDelete: "cascade" }),
	/// The message of the incident report
	message: text("message").notNull(),
	/// The status of the incident report
	status: text("status", { enum: ["investigating", "identified", "monitoring", "resolved"] }).notNull(),
	/// When the incident report took place
	timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// One (IncidentReport) to one (Incident) relationship
export const incidentReportsRelations = relations(incidentReports, ({ one }) => ({
	incidentId: one(incidents, {
		fields: [incidentReports.incidentId],
		references: [incidents.id],
	})
}));

/// Monitor specific tables --- DO NOT EDIT OR REMOVE
export const trackedIncidents = pgTable("tracked_incidents", {
	monitorId: varchar("monitor_id", { length: 16 }).notNull(),
	///
	// DIRECT COPY OF INCIDENTS TABLE
	///
	/// The unique identifier for the incident
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	// The title of the incident
	title: text("title").notNull(),
	/// When the incident was started
	startedAt: timestamp("started_at").notNull().defaultNow(),
	/// When the incident was acknowledged
	acknowledgedAt: timestamp("acknowledged_at"),
	/// When the incident was resolved
	resolvedAt: timestamp("resolved_at"),
	/// If the incident was auto-resolved
	autoResolved: boolean("auto_resolved").notNull().default(false),
	/// How many times a failing monitor has had a successful ping
	success: integer("success").notNull().default(0),
	/// If the monitoring report has been created or not
	monitoring_created: boolean("monitoring_created").notNull().default(false),
	/// If the investigating report has been created or not
	investigating_created: boolean("investigating_created").notNull().default(false),
})
