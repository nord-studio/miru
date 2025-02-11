import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ----------------------------------------
// --------------- Auth -------------------
// ----------------------------------------

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	username: text("username").notNull().unique(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", {
		mode: "timestamp",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ----------------------------------------
// -------------- Monitors ----------------
// ----------------------------------------

export const monitors = sqliteTable("monitors", {
	/// The unique identifier for the monitor
	id: text("id").primaryKey(),
	/// The name of the monitor
	name: text("name").notNull(),
	/// The type of monitor (e.g. HTTP, TCP, etc)
	type: text("type").notNull(),
	/// The URL to monitor
	url: text("url").notNull(),
	/// The interval in seconds to check the monitor
	interval: integer("interval").notNull(),
	/// When the monitor was created
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	/// When the monitor was last updated
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	/// A percentage with two decimal places (e.g. 99.99)
	uptime: integer("uptime"),
})

export const pings = sqliteTable("pings", {
	/// The unique identifier for the ping
	id: text("id").primaryKey(),
	/// A reference to what monitor this ping belongs to
	monitorId: text("monitor_id").notNull().references(() => monitors.id),
	/// The status code of the ping. true = success, false = failure
	status: integer("status", { mode: "boolean" }).notNull(),
	/// The latency of the DNS, TCP, TLS, TTFB, and transfer
	latency: text("latency", { mode: "json" }).notNull(),
	/// The headers of the response
	headers: text("headers", { mode: "json" }),
	/// The response time of the ping
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
})

