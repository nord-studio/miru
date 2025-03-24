ALTER TABLE "user" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;