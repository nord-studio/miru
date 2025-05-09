CREATE TABLE "apikey" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"workspace_id" varchar(16) NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"expires_at" timestamp DEFAULT now() + interval '30 day',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;