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
	/// Description of the status page
	description: text("description"),
	/// The ID of the status page logo in S3 bucket
	logo: text("logo"),
	/// The ID of the status page dark logo in S3 bucket
	darkLogo: text("dark_logo"),
	/// The ID of the status page favicon in S3 bucket
	favicon: text("favicon"),
	/// The brand color of the status page
	brandColor: text("brand_color").default("#000000").notNull(),
	/// The design of the status page
	design: text("design", { enum: ["simple", "panda", "stormtrooper"] }).default("simple").notNull(),
	/// Force the brand color to be manually determined to be light or dark
	forcedTheme: text("theme", { enum: ["auto", "light", "dark"] }).default("auto").notNull(),
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