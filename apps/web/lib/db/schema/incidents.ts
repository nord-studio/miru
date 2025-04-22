import { monitorsToIncidents } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { relations } from "drizzle-orm/relations";
import { pgTable, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";

export const incidents = pgTable("incidents", {
	/// The unique identifier for the incident
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	// The title of the incident
	title: text("title").notNull(),
	/// When the incident was started
	started_at: timestamp("started_at").notNull().defaultNow(),
	/// When the incident was acknowledged
	acknowledged_at: timestamp("acknowledged_at"),
	/// When the incident was resolved
	resolved_at: timestamp("resolved_at"),
	/// If the incident was auto-resolved
	auto_resolved: boolean("auto_resolved").notNull().default(false),
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
	incidentId: varchar("incident_id", { length: 16 }).notNull(),
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