CREATE TABLE `account_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`symbol` text NOT NULL,
	`kind` text NOT NULL,
	`threshold` real,
	`enabled` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`triggered_at` integer,
	`message` text,
	`seen_at` integer
);
--> statement-breakpoint
CREATE INDEX `account_alert_owner` ON `account_alerts` (`user_id`);--> statement-breakpoint
CREATE INDEX `account_alert_active` ON `account_alerts` (`enabled`);--> statement-breakpoint
CREATE TABLE `account_drawings` (
	`user_id` text NOT NULL,
	`symbol` text NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_coin_drawing` ON `account_drawings` (`user_id`,`symbol`);--> statement-breakpoint
CREATE TABLE `account_prefs` (
	`user_id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `maintenance_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	`payload` text
);
