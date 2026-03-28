ALTER TABLE `submissions` ADD `start_page` int;--> statement-breakpoint
ALTER TABLE `submissions` ADD `end_page` int;--> statement-breakpoint
ALTER TABLE `submissions` ADD `submission_mode` enum('current','archive') DEFAULT 'archive';