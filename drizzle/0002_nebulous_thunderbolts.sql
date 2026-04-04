CREATE TABLE `application_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`application_id` int NOT NULL,
	`interest_id` int NOT NULL,
	CONSTRAINT `application_interests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `master_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `master_interests_id` PRIMARY KEY(`id`),
	CONSTRAINT `master_interests_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD `cv_url` varchar(500);--> statement-breakpoint
ALTER TABLE `applications` ADD `photo_url` varchar(500);--> statement-breakpoint
ALTER TABLE `applications` ADD `nationality` varchar(100);--> statement-breakpoint
ALTER TABLE `submission_authors` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `submission_authors` ADD `designation` varchar(255);--> statement-breakpoint
ALTER TABLE `submission_authors` ADD `institution` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `has_seen_promotion` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `application_interests` ADD CONSTRAINT `application_interests_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_interests` ADD CONSTRAINT `application_interests_interest_id_master_interests_id_fk` FOREIGN KEY (`interest_id`) REFERENCES `master_interests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_authors` DROP COLUMN `affiliation`;