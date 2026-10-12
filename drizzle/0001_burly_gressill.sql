CREATE TABLE `enrichment_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`updated_at` integer NOT NULL,
	`payload` text NOT NULL
);
