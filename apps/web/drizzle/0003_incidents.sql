CREATE TABLE "incident_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"message" text NOT NULL,
	"status" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"monitor_ids" text NOT NULL,
	"title" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp,
	"resolve_at" timestamp,
	"auto_resolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incident_updates" ADD CONSTRAINT "incident_updates_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_ids_monitors_id_fk" FOREIGN KEY ("monitor_ids") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;