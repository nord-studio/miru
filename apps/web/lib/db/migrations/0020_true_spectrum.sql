DROP TABLE "email_notifications" CASCADE;--> statement-breakpoint
DROP TABLE "webhook_notifications" CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "url" text;