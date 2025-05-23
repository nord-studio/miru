import { monitorsToEvents } from "@/lib/db/schema/monitors";
import { generateId } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
	/// The unique identifier for the event
	id: varchar("id", { length: 16 }).primaryKey().$defaultFn(generateId),
	// The title of the event
	title: varchar("title", { length: 36 }).notNull(),
	// The message of the event
	message: varchar("message", { length: 255 }).notNull(),
	// when the event is planned to start
	startsAt: timestamp("started_at").notNull(),
	// how long event is planned to last (in minutes)
	duration: integer("duration").notNull().default(60),
	// if the event will automatically be marked as complete
	autoComplete: boolean("auto_complete").notNull().default(false),
	// When the event was created
	createdAt: timestamp("created_at").notNull().defaultNow(),
	// When the event was last updated
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventsRelations = relations(events, ({ many }) => ({
	// Many (Monitors) to many (Events) relationship
	monitorsToEvents: many(monitorsToEvents),
}))