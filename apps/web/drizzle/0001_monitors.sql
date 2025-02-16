CREATE TABLE "monitors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"interval" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pings" (
	"id" text PRIMARY KEY NOT NULL,
	"monitor_id" text NOT NULL,
	"success" boolean DEFAULT false NOT NULL,
	"status" integer,
	"latency" integer NOT NULL,
	"headers" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pings" ADD CONSTRAINT "pings_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;