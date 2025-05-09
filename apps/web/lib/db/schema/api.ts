import { workspaces } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { ApiKeyPermissions } from "@/types/api";
import { json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const apikey = pgTable("apikey", {
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	workspaceId: varchar("workspace_id", { length: 16 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	expiresAt: timestamp("expires_at"),
	permissions: json("permissions").$type<ApiKeyPermissions>().notNull().default({ monitors: [], incidents: [], pages: [] }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});