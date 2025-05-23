CREATE TABLE "events" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"title" varchar(36) NOT NULL,
	"message" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"auto_complete" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitors_to_events" (
	"monitor_id" varchar(16) NOT NULL,
	"event_id" varchar(16) NOT NULL,
	CONSTRAINT "monitors_to_events_monitor_id_event_id_pk" PRIMARY KEY("monitor_id","event_id")
);
--> statement-breakpoint
ALTER TABLE "monitors_to_events" ADD CONSTRAINT "monitors_to_events_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitors_to_events" ADD CONSTRAINT "monitors_to_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;