ALTER TABLE "workspaces" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_slug_unique" UNIQUE("slug");