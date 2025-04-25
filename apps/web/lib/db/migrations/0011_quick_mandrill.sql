ALTER TABLE "status_pages" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "status_pages" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "status_pages" ADD COLUMN "dark_logo" text;--> statement-breakpoint
ALTER TABLE "status_pages" ADD COLUMN "favicon" text;--> statement-breakpoint
ALTER TABLE "status_pages" ADD COLUMN "brand_color" text DEFAULT '#000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "status_pages" ADD COLUMN "design" text DEFAULT 'simple' NOT NULL;--> statement-breakpoint
ALTER TABLE "status_pages" ADD COLUMN "force_is_light" boolean DEFAULT false NOT NULL;