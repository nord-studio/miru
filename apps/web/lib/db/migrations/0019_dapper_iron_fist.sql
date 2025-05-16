CREATE TABLE "webhook_notifications" (
	"base_id" varchar(16) PRIMARY KEY NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "webhook_notifications" ADD CONSTRAINT "webhook_notifications_base_id_notifications_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_name_unique" UNIQUE("name");