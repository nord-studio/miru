import { monitors, user } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const workspaces = pgTable("workspaces", {
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const workspaceMembers = pgTable("workspace_members", {
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	workspaceId: varchar("workspace_id", { length: 16 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const workspaceInvites = pgTable("workspace_invites", {
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	workspaceId: varchar("workspace_id", { length: 16 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
	role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
	validUntil: timestamp("valid_until").notNull().default(sql`NOW() + INTERVAL '14 days'`),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
	monitors: many(monitors),
	members: many(workspaceMembers)
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [workspaceMembers.workspaceId],
		references: [workspaces.id]
	}),
	user: one(user, {
		fields: [workspaceMembers.userId],
		references: [user.id]
	})
}));