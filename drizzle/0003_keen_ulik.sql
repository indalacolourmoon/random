ALTER TABLE `submissions` ADD `co_authors` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `published_at` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `has_seen_promotion` tinyint DEFAULT 0;