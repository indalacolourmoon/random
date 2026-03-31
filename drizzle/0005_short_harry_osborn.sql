ALTER TABLE `submissions` MODIFY COLUMN `status` enum('submitted','under_review','accepted','rejected','published','paid','retracted') DEFAULT 'submitted';--> statement-breakpoint
ALTER TABLE `reviews` ADD `completed_at` timestamp;--> statement-breakpoint
ALTER TABLE `submissions` ADD `retraction_notice_url` varchar(500);