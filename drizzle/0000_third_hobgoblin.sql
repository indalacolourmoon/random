CREATE TABLE if not exists `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`application_type` enum('reviewer','editor') NOT NULL DEFAULT 'reviewer',
	`full_name` varchar(255) NOT NULL,
	`designation` varchar(255) NOT NULL,
	`institute` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`cv_url` varchar(500) NOT NULL,
	`photo_url` varchar(500) NOT NULL,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE if not exists `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`subject` varchar(255),
	`message` text NOT NULL,
	`reply_text` text,
	`replied_at` timestamp,
	`status` enum('unread','read','archived') DEFAULT 'unread',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE if not exists `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'INR',
	`status` enum('unpaid','paid','verified') DEFAULT 'unpaid',
	`transaction_id` varchar(255),
	`paid_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE if not exists `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`reviewer_id` int NOT NULL,
	`status` enum('pending','in_progress','completed') DEFAULT 'pending',
	`deadline` date,
	`feedback` text,
	`feedback_file_path` varchar(500),
	`assigned_at` timestamp DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE if not exists `settings` (
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_setting_key` PRIMARY KEY(`setting_key`)
);
--> statement-breakpoint
CREATE TABLE if not exists `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paper_id` varchar(50) NOT NULL,
	`title` text NOT NULL,
	`abstract` text,
	`keywords` text,
	`author_name` varchar(255) NOT NULL,
	`author_email` varchar(255) NOT NULL,
	`affiliation` varchar(500),
	`status` enum('submitted','under_review','accepted','rejected','published','paid') DEFAULT 'submitted',
	`file_path` varchar(500),
	`pdf_url` varchar(500),
	`submitted_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`issue_id` int,
	`is_free_publish` tinyint DEFAULT 0,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `paper_id` UNIQUE(`paper_id`)
);
--> statement-breakpoint
CREATE TABLE if not exists `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	`full_name` varchar(255),
	`designation` varchar(255),
	`institute` varchar(255),
	`phone` varchar(20),
	`bio` text,
	`photo_url` varchar(500),
	`role` enum('admin','editor','reviewer') DEFAULT 'admin',
	`created_at` timestamp DEFAULT (now()),
	`invitation_token` varchar(255),
	`invitation_expires` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email` UNIQUE(`email`),
	CONSTRAINT `invitation_token` UNIQUE(`invitation_token`)
);
--> statement-breakpoint
CREATE TABLE if not exists `volumes_issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`volume_number` int NOT NULL,
	`issue_number` int NOT NULL,
	`year` int NOT NULL,
	`month_range` varchar(100),
	`status` enum('open','published') DEFAULT 'open',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `volumes_issues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_issue_id_volumes_issues_id_fk` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX `app_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `app_type_idx` ON `applications` (`application_type`);--> statement-breakpoint
CREATE INDEX `submission_id` ON `payments` (`submission_id`);--> statement-breakpoint
CREATE INDEX `submission_id` ON `reviews` (`submission_id`);--> statement-breakpoint
CREATE INDEX `reviewer_id` ON `reviews` (`reviewer_id`);--> statement-breakpoint
CREATE INDEX `issue_id` ON `submissions` (`issue_id`);--> statement-breakpoint
CREATE INDEX `author_email_idx` ON `submissions` (`author_email`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `submissions` (`status`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);