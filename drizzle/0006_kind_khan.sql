CREATE TABLE `application_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`application_id` int NOT NULL,
	`interest` varchar(255) NOT NULL,
	CONSTRAINT `application_interests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD `rejection_reason` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `reviewed_at` timestamp;--> statement-breakpoint
ALTER TABLE `applications` ADD `reviewed_by` int;--> statement-breakpoint
ALTER TABLE `users` ADD `orcid_id` varchar(50);--> statement-breakpoint
ALTER TABLE `application_interests` ADD CONSTRAINT `application_interests_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `app_interest_idx` ON `application_interests` (`application_id`);--> statement-breakpoint
CREATE INDEX `interest_val_idx` ON `application_interests` (`interest`);--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `reviewed_by_idx` ON `applications` (`reviewed_by`);