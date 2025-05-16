CREATE TABLE "email_notifications" (
	"base_id" varchar(16) PRIMARY KEY NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"workspace_id" varchar(16) NOT NULL,
	"provider" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications_to_monitors" (
	"monitor_id" varchar(16) NOT NULL,
	"notification_id" varchar(16) NOT NULL,
	CONSTRAINT "notifications_to_monitors_monitor_id_notification_id_pk" PRIMARY KEY("monitor_id","notification_id")
);
--> statement-breakpoint
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_base_id_notifications_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_to_monitors" ADD CONSTRAINT "notifications_to_monitors_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_to_monitors" ADD CONSTRAINT "notifications_to_monitors_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;