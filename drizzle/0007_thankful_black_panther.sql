ALTER TABLE `contact_messages` MODIFY COLUMN `status` enum('pending','resolved','archived') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `resolved_at` timestamp;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `resolved_by` int;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_resolved_by_users_id_fk` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `msg_status_idx` ON `contact_messages` (`status`);--> statement-breakpoint
CREATE INDEX `resolved_by_msg_idx` ON `contact_messages` (`resolved_by`);