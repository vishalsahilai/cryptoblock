CREATE TABLE `predictions` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`horizon` integer NOT NULL,
	`model_version` text NOT NULL,
	`created_at` integer NOT NULL,
	`as_of` integer NOT NULL,
	`due_at` integer NOT NULL,
	`reference_price` real NOT NULL,
	`predicted_pct` real NOT NULL,
	`target_price` real NOT NULL,
	`low_price` real NOT NULL,
	`high_price` real NOT NULL,
	`snapshot` text NOT NULL,
	`source` text NOT NULL,
	`actual_price` real,
	`actual_pct` real,
	`direction_hit` integer,
	`error_pp` real,
	`range_hit` integer,
	`evaluated_at` integer,
	`last_attempt_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prediction_origin_unique` ON `predictions` (`symbol`,`horizon`,`model_version`,`as_of`);--> statement-breakpoint
CREATE INDEX `prediction_due` ON `predictions` (`due_at`,`actual_price`);