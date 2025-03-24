CREATE TABLE "workspace_invites" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"workspace_id" varchar(16) NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"valid_until" timestamp DEFAULT NOW() + INTERVAL '14 days' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monitors" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspace_invites_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;