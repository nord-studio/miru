CREATE TABLE `monitors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`interval` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`uptime` integer
);
--> statement-breakpoint
CREATE TABLE `pings` (
	`id` text PRIMARY KEY NOT NULL,
	`monitor_id` text NOT NULL,
	`status` integer NOT NULL,
	`latency` text NOT NULL,
	`headers` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitors`(`id`) ON UPDATE no action ON DELETE no action
);
