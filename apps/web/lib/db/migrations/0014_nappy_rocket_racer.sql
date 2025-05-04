CREATE TABLE "tracked_incidents" (
	"monitor_id" varchar(16) NOT NULL,
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"auto_resolved" boolean DEFAULT false NOT NULL
);
