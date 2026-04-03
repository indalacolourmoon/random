CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`performed_by` varchar(36),
	`metadata` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('reviewer','editor') NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`designation` varchar(255) NOT NULL,
	`institute` varchar(255) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewed_by` varchar(36),
	`reviewed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_email_type_unique` UNIQUE(`email`,`type`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`subject` varchar(255),
	`message` text NOT NULL,
	`status` enum('pending','resolved','archived') NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`action_link` varchar(255),
	`is_read` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'INR',
	`status` enum('pending','paid','verified','failed') NOT NULL DEFAULT 'pending',
	`provider` varchar(50),
	`transaction_id` varchar(255),
	`paid_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_submission_id_unique` UNIQUE(`submission_id`),
	CONSTRAINT `payments_transaction_id_unique` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `publications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`issue_id` int NOT NULL,
	`final_pdf_url` varchar(500) NOT NULL,
	`start_page` int,
	`end_page` int,
	`doi` varchar(100),
	`published_at` timestamp DEFAULT (now()),
	CONSTRAINT `publications_id` PRIMARY KEY(`id`),
	CONSTRAINT `publications_submission_id_unique` UNIQUE(`submission_id`),
	CONSTRAINT `publications_doi_unique` UNIQUE(`doi`)
);
--> statement-breakpoint
CREATE TABLE `review_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`reviewer_id` varchar(36) NOT NULL,
	`version_id` int NOT NULL,
	`assigned_by` varchar(36) NOT NULL,
	`review_round` int NOT NULL DEFAULT 1,
	`status` enum('assigned','accepted','declined','completed') NOT NULL DEFAULT 'assigned',
	`deadline` date,
	`assigned_at` timestamp DEFAULT (now()),
	`responded_at` timestamp,
	CONSTRAINT `review_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_assignment` UNIQUE(`submission_id`,`reviewer_id`,`version_id`,`review_round`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignment_id` int NOT NULL,
	`decision` enum('accept','minor_revision','major_revision','reject') NOT NULL,
	`score` int,
	`confidence` int,
	`comments_to_author` text,
	`comments_to_editor` text,
	`created_at` timestamp DEFAULT (now()),
	`submitted_at` timestamp,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_assignment_id_unique` UNIQUE(`assignment_id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_setting_key` PRIMARY KEY(`setting_key`)
);
--> statement-breakpoint
CREATE TABLE `submission_authors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`affiliation` varchar(500),
	`is_corresponding` boolean NOT NULL DEFAULT false,
	`order_index` int NOT NULL DEFAULT 0,
	CONSTRAINT `submission_authors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submission_editors` (
	`submission_id` int NOT NULL,
	`editor_id` varchar(36) NOT NULL,
	`assigned_at` timestamp DEFAULT (now()),
	CONSTRAINT `submission_editors_submission_id_editor_id_pk` PRIMARY KEY(`submission_id`,`editor_id`)
);
--> statement-breakpoint
CREATE TABLE `submission_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version_id` int NOT NULL,
	`file_type` enum('main_manuscript','pdf_version','supplementary','feedback','payment_proof') NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`original_name` varchar(255),
	`file_size` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `submission_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submission_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`version_number` int NOT NULL DEFAULT 1,
	`title` text NOT NULL,
	`abstract` text,
	`keywords` text,
	`subject_area` varchar(255),
	`changelog` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `submission_versions_id` PRIMARY KEY(`id`),
	CONSTRAINT `submission_version_unique` UNIQUE(`submission_id`,`version_number`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paper_id` varchar(100) NOT NULL,
	`slug` varchar(255),
	`status` enum('submitted','editor_assigned','under_review','revision_requested','accepted','rejected','payment_pending','published') NOT NULL DEFAULT 'submitted',
	`final_decision` enum('accept','reject','withdrawn'),
	`decision_at` timestamp,
	`decision_by` varchar(36),
	`corresponding_author_id` varchar(36) NOT NULL,
	`issue_id` int,
	`submitted_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `submissions_paper_id_unique` UNIQUE(`paper_id`),
	CONSTRAINT `submissions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `user_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('editor','reviewer') NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`invited_by` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`designation` varchar(255),
	`institute` varchar(255),
	`phone` varchar(20),
	`orcid_id` varchar(50),
	`nationality` varchar(100) DEFAULT 'India',
	`bio` text,
	`photo_url` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	`role` enum('admin','editor','reviewer','author') NOT NULL DEFAULT 'author',
	`is_active` boolean NOT NULL DEFAULT true,
	`is_email_verified` boolean NOT NULL DEFAULT false,
	`email_verified_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `volumes_issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`volume_number` int NOT NULL,
	`issue_number` int NOT NULL,
	`year` int NOT NULL,
	`month_range` varchar(100),
	`status` enum('open','published') NOT NULL DEFAULT 'open',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `volumes_issues_id` PRIMARY KEY(`id`),
	CONSTRAINT `vol_issue_year` UNIQUE(`volume_number`,`issue_number`,`year`)
);
--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_performed_by_users_id_fk` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publications` ADD CONSTRAINT `publications_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publications` ADD CONSTRAINT `publications_issue_id_volumes_issues_id_fk` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_assignments` ADD CONSTRAINT `review_assignments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_assignments` ADD CONSTRAINT `review_assignments_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_assignments` ADD CONSTRAINT `review_assignments_version_id_submission_versions_id_fk` FOREIGN KEY (`version_id`) REFERENCES `submission_versions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_assignments` ADD CONSTRAINT `review_assignments_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_assignment_id_review_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `review_assignments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_authors` ADD CONSTRAINT `submission_authors_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_editors` ADD CONSTRAINT `submission_editors_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_editors` ADD CONSTRAINT `submission_editors_editor_id_users_id_fk` FOREIGN KEY (`editor_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_files` ADD CONSTRAINT `submission_files_version_id_submission_versions_id_fk` FOREIGN KEY (`version_id`) REFERENCES `submission_versions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_versions` ADD CONSTRAINT `submission_versions_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_decision_by_users_id_fk` FOREIGN KEY (`decision_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_corresponding_author_id_users_id_fk` FOREIGN KEY (`corresponding_author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_issue_id_volumes_issues_id_fk` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_invitations` ADD CONSTRAINT `user_invitations_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notif_user_idx` ON `notifications` (`user_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `sub_author_idx` ON `submission_authors` (`submission_id`);--> statement-breakpoint
CREATE INDEX `author_order_idx` ON `submission_authors` (`submission_id`,`order_index`);--> statement-breakpoint
CREATE INDEX `file_version_idx` ON `submission_files` (`version_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `submissions` (`status`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `submissions` (`corresponding_author_id`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);