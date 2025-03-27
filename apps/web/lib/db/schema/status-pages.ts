import { monitors, workspaces } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { relations } from "drizzle-orm/relations";
import { integer } from "drizzle-orm/pg-core";
import { text, pgTable, varchar, boolean } from "drizzle-orm/pg-core";

export const statusPages = pgTable("status_pages", {
	/// The unique identifier for the status page
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	/// The workspace id the status page belongs to
	workspaceId: varchar("workspace_id", { length: 16 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
	/// The name of the status page
	name: text("name").notNull(),
	/// If the status page is enabled
	enabled: boolean("enabled").notNull().default(false),
	/// If the status page points to the root of the APP_DOMAIN
	root: boolean("root").notNull().default(false),
	/// The domain of the status page
	domain: text("domain").unique(),
});

export const statusPageMonitors = pgTable("status_page_monitors", {
	/// The unique identifier for the status page monitor
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	/// The status page id the monitor belongs to
	statusPageId: varchar("status_page_id", { length: 16 }).notNull().references(() => statusPages.id, { onDelete: "cascade" }),
	/// The monitor id
	monitorId: varchar("monitor_id", { length: 16 }).notNull().references(() => monitors.id, { onDelete: "cascade" }),
	/// The order of the monitor
	order: integer("order").notNull(),
	/// If the uptime percentage should be shown
	showUptime: boolean("show_uptime").notNull().default(true),
	/// If the number of pings should be shown
	showPings: boolean("show_pings").notNull().default(true),
});

// TODO: Implement status page branding with S3
// export const statusPageBranding = pgTable("status_page_branding", {
// 	/// The status page id the branding belongs to
// 	id: varchar("status_page_id", { length: 16 }).primaryKey().references(() => statusPages.id, { onDelete: "cascade" }),
// 	/// The logo of the status page
// 	logo: jsonb("logo"),
// 	/// The favicon of the status page
// 	favicon: jsonb("favicon"),
// });

export const statusPageRelations = relations(statusPages, ({ many }) => ({
	statusPageMonitors: many(statusPageMonitors)
}));

export const statusPageMonitorsRelations = relations(statusPageMonitors, ({ one }) => ({
	statusPage: one(statusPages, {
		fields: [statusPageMonitors.statusPageId],
		references: [statusPages.id]
	}),
	monitor: one(monitors, {
		fields: [statusPageMonitors.monitorId],
		references: [monitors.id]
	})
}))