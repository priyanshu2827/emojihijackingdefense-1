CREATE TABLE `analyses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`input_text` text NOT NULL,
	`sanitized` text NOT NULL,
	`normalized` text NOT NULL,
	`overall_risk` integer NOT NULL,
	`token_drift_ratio` real NOT NULL,
	`raw_tokens` text NOT NULL,
	`tokens` text NOT NULL,
	`alerts` text NOT NULL,
	`summary` text NOT NULL,
	`matrix` text NOT NULL,
	`removed` text NOT NULL,
	`policy_mode` text DEFAULT 'Observe' NOT NULL,
	`commit_sha` text,
	`build_time` text,
	`batch_id` integer,
	`user_id` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_count` integer NOT NULL,
	`alert_count` integer NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`meta` text,
	`analysis_id` integer,
	`route` text,
	`ip` text,
	`user_agent` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rule_packs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`yaml` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`version` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rule_packs_name_unique` ON `rule_packs` (`name`);