ALTER TABLE "monitors_to_incidents" RENAME COLUMN "incident_id	" TO "incident_id";--> statement-breakpoint
ALTER TABLE "monitors_to_incidents" DROP CONSTRAINT "monitors_to_incidents_incident_id	_incidents_id_fk";
--> statement-breakpoint
ALTER TABLE "monitors_to_incidents" DROP CONSTRAINT "monitors_to_incidents_monitor_id_incident_id	_pk";--> statement-breakpoint
ALTER TABLE "monitors_to_incidents" ADD CONSTRAINT "monitors_to_incidents_monitor_id_incident_id_pk" PRIMARY KEY("monitor_id","incident_id");--> statement-breakpoint
ALTER TABLE "monitors_to_incidents" ADD CONSTRAINT "monitors_to_incidents_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;