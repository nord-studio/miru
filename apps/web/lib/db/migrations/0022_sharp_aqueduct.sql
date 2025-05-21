CREATE TABLE "subscribers" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"workspace_id" varchar(16) NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;