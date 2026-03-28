import { mysqlTable, int, mysqlEnum, varchar, timestamp, text, index, unique, decimal, date, boolean, tinyint } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
    id: int("id").primaryKey().autoincrement().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    fullName: varchar("full_name", { length: 255 }),
    designation: varchar("designation", { length: 255 }),
    institute: varchar("institute", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    bio: text("bio"),
    photoUrl: varchar("photo_url", { length: 500 }),
    role: mysqlEnum("role", ['admin', 'editor', 'reviewer']).default('admin'),
    createdAt: timestamp("created_at").defaultNow(),
    invitationToken: varchar("invitation_token", { length: 255 }),
    invitationExpires: timestamp("invitation_expires"),
    nationality: varchar("nationality", { length: 100 }).default('India'),
    hasSeenPromotion: tinyint("has_seen_promotion").default(0),
}, (table) => [
    unique("email").on(table.email),
    unique("invitation_token").on(table.invitationToken),
    index("role_idx").on(table.role),
]);

export const volumesIssues = mysqlTable("volumes_issues", {
    id: int("id").primaryKey().autoincrement().notNull(),
    volumeNumber: int("volume_number").notNull(),
    issueNumber: int("issue_number").notNull(),
    year: int("year").notNull(),
    monthRange: varchar("month_range", { length: 100 }),
    status: mysqlEnum("status", ['open', 'published']).default('open'),
    createdAt: timestamp("created_at").defaultNow(),
});

export const submissions = mysqlTable("submissions", {
    id: int("id").primaryKey().autoincrement().notNull(),
    paperId: varchar("paper_id", { length: 50 }).notNull(),
    title: text("title").notNull(),
    abstract: text("abstract"),
    keywords: text("keywords"),
    authorName: varchar("author_name", { length: 255 }).notNull(),
    authorEmail: varchar("author_email", { length: 255 }).notNull(),
    affiliation: varchar("affiliation", { length: 500 }),
    status: mysqlEnum("status", ['submitted', 'under_review', 'accepted', 'rejected', 'published', 'paid']).default('submitted'),
    filePath: varchar("file_path", { length: 500 }),
    pdfUrl: varchar("pdf_url", { length: 500 }),
    submittedAt: timestamp("submitted_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
    issueId: int("issue_id").references(() => volumesIssues.id, { onDelete: "restrict", onUpdate: "restrict" }),
    isFreePublish: tinyint("is_free_publish").default(0),
    coAuthors: text("co_authors"),
    publishedAt: timestamp("published_at"),
    startPage: int("start_page"),
    endPage: int("end_page"),
    submissionMode: mysqlEnum("submission_mode", ['current', 'archive']).default('archive'),
}, (table) => [
    index("issue_id").on(table.issueId),
    unique("paper_id").on(table.paperId),
    index("author_email_idx").on(table.authorEmail),
    index("status_idx").on(table.status),
]);

export const reviews = mysqlTable("reviews", {
    id: int("id").primaryKey().autoincrement().notNull(),
    submissionId: int("submission_id").notNull().references(() => submissions.id),
    reviewerId: int("reviewer_id").notNull().references(() => users.id),
    status: mysqlEnum("status", ['pending', 'in_progress', 'completed']).default('pending'),
    deadline: date("deadline", { mode: 'string' }),
    feedback: text("feedback"),
    feedbackFilePath: varchar("feedback_file_path", { length: 500 }),
    assignedAt: timestamp("assigned_at").defaultNow(),
}, (table) => [
    index("submission_id").on(table.submissionId),
    index("reviewer_id").on(table.reviewerId),
]);

export const payments = mysqlTable("payments", {
    id: int("id").primaryKey().autoincrement().notNull(),
    submissionId: int("submission_id").notNull().references(() => submissions.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default('INR'),
    status: mysqlEnum("status", ['unpaid', 'paid', 'verified']).default('unpaid'),
    transactionId: varchar("transaction_id", { length: 255 }),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("submission_id").on(table.submissionId),
]);

export const contactMessages = mysqlTable("contact_messages", {
    id: int("id").primaryKey().autoincrement().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }),
    message: text("message").notNull(),
    replyText: text("reply_text"),
    repliedAt: timestamp("replied_at"),
    status: mysqlEnum("status", ['unread', 'read', 'archived']).default('unread'),
    createdAt: timestamp("created_at").defaultNow(),
});

export const applications = mysqlTable("applications", {
    id: int("id").primaryKey().autoincrement().notNull(),
    applicationType: mysqlEnum("application_type", ['reviewer', 'editor']).default('reviewer').notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    designation: varchar("designation", { length: 255 }).notNull(),
    institute: varchar("institute", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    cvUrl: varchar("cv_url", { length: 500 }).notNull(),
    photoUrl: varchar("photo_url", { length: 500 }).notNull(),
    status: mysqlEnum("status", ['pending', 'approved', 'rejected']).default('pending'),
    nationality: varchar("nationality", { length: 100 }).default('India'),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    unique("email").on(table.email),
    index("app_status_idx").on(table.status),
    index("app_type_idx").on(table.applicationType),
]);

export const settings = mysqlTable("settings", {
    settingKey: varchar("setting_key", { length: 100 }).primaryKey().notNull(),
    settingValue: text("setting_value"),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
