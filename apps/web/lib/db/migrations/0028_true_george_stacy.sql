ALTER TABLE "notifications" ALTER COLUMN "url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "type" text NOT NULL;