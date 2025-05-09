ALTER TABLE "apikey" ALTER COLUMN "expires_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "apikey" DROP COLUMN "key";