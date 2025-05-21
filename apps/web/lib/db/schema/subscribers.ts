import { workspaces } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";

export const subscribers = pgTable("subscribers", {
	/// The unique identifier for the notification
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	/// A reference to the monitor this notification belongs to
	workspaceId: varchar("workspace_id", { length: 16 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
	/// The email address of the subscriber
	email: text("email").notNull(),
});