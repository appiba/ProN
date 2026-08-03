CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`detail` text NOT NULL,
	`actor_role` text DEFAULT 'Superadministrador' NOT NULL,
	`project_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`item` text NOT NULL,
	`category` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`unit_cost` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Disponible' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `movements` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`concept` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`movement_date` text NOT NULL,
	`status` text DEFAULT 'Registrado' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`partner_id` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`contribution` real DEFAULT 0 NOT NULL,
	`participation` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Activo' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`country` text DEFAULT 'Ecuador' NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`timezone` text DEFAULT 'America/Guayaquil' NOT NULL,
	`status` text DEFAULT 'Activo' NOT NULL,
	`budget` real DEFAULT 0 NOT NULL,
	`objective` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'Activo' NOT NULL,
	`email_hash` text,
	`project_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
