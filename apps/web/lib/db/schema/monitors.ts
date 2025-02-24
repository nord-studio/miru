import { generateId } from "@/lib/utils";
import { pgTable, text, timestamp, integer, json, boolean } from "drizzle-orm/pg-core";

export const monitors = pgTable("monitors", {
	/// The unique identifier for the monitor
	id: text("id").primaryKey().$defaultFn(generateId),
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

export const pings = pgTable("pings", {
	/// The unique identifier for the ping
	id: text("id").primaryKey().$defaultFn(generateId),
	/// A reference to what monitor this ping belongs to
	monitorId: text("monitor_id").notNull().references(() => monitors.id, { onDelete: "cascade" }),
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