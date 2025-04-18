CREATE TABLE "status_page_monitors" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"status_page_id" varchar(16) NOT NULL,
	"monitor_id" varchar(16) NOT NULL,
	"order" integer NOT NULL,
	"show_uptime" boolean DEFAULT true NOT NULL,
	"show_pings" boolean DEFAULT true NOT NULL,
	CONSTRAINT "status_page_monitors_order_unique" UNIQUE("order")
);
--> statement-breakpoint
CREATE TABLE "status_pages" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"workspace_id" varchar(16) NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"root" boolean DEFAULT false NOT NULL,
	"domain" text,
	CONSTRAINT "status_pages_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
ALTER TABLE "status_page_monitors" ADD CONSTRAINT "status_page_monitors_status_page_id_status_pages_id_fk" FOREIGN KEY ("status_page_id") REFERENCES "public"."status_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_page_monitors" ADD CONSTRAINT "status_page_monitors_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_pages" ADD CONSTRAINT "status_pages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;