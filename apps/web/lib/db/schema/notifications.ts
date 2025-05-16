import { monitors, workspaces } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text, varchar } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
	/// The unique identifier for the notification
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	/// A reference to the monitor this notification belongs to
	workspaceId: varchar("workspace_id", { length: 16 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
	/// The name of the channel
	name: text("name").notNull().unique(),
	/// The provider of the notification (e.g. email, webhook, etc)
	provider: text("provider", { enum: ["email", "slack", "discord"] }).notNull(),
	/// The email address for the notification (if applicable)
	email: text("email"),
	/// The URL for the notification (if applicable)
	url: text("url"),
});

// Many (notifications) to many (monitors) relationship
export const notificationsRelations = relations(notifications, ({ many }) => ({
	notificationsToMonitors: many(notificationsToMonitors)
}))

// Join table for the many to many relationship between monitors and notifications
export const notificationsToMonitors = pgTable("notifications_to_monitors", {
	monitorId: varchar("monitor_id", { length: 16 }).notNull().references(() => monitors.id, { onDelete: "cascade" }),
	notificationId: varchar("notification_id", { length: 16 }).notNull().references(() => notifications.id, { onDelete: "cascade" }),
}, (t) => [
	primaryKey({ columns: [t.monitorId, t.notificationId] })
]);

export const notificationsToMonitorsRelations = relations(notificationsToMonitors, ({ one }) => ({
	monitor: one(monitors, {
		fields: [notificationsToMonitors.monitorId],
		references: [monitors.id]
	}),
	notification: one(notifications, {
		fields: [notificationsToMonitors.notificationId],
		references: [notifications.id]
	})
}))