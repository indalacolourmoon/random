import { 
  mysqlTable, int, mysqlEnum, varchar, timestamp, 
  text, index, unique, decimal, date, boolean, 
  primaryKey 
} from "drizzle-orm/mysql-core";
import { sql, relations } from "drizzle-orm";

// 👤 1. USERS (AUTH LAYER) - Updated to UUID
export const users = mysqlTable("users", {
    id: varchar("id", { length: 36 }).primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    role: mysqlEnum("role", ['admin', 'editor', 'reviewer', 'author']).default('author').notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false).notNull(),
    emailVerifiedAt: timestamp("email_verified_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
    deletedAt: timestamp("deleted_at"),
}, (table) => [
    index("role_idx").on(table.role),
]);

export const usersRelations = relations(users, ({ one, many }) => ({
    profile: one(userProfiles, {
        fields: [users.id],
        references: [userProfiles.userId],
    }),
    submissions: many(submissions),
    invitations: many(userInvitations),
    assignedSubmissions: many(submissionEditors),
    reviewAssignments: many(reviewAssignments),
    notifications: many(notifications),
    activityLogs: many(activityLogs),
}));

// 👥 2. USER PROFILES
export const userProfiles = mysqlTable("user_profiles", {
    id: int("id").primaryKey().autoincrement().notNull(),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    designation: varchar("designation", { length: 255 }),
    institute: varchar("institute", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    orcidId: varchar("orcid_id", { length: 50 }),
    nationality: varchar("nationality", { length: 100 }).default('India'),
    bio: text("bio"),
    photoUrl: varchar("photo_url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(users, {
        fields: [userProfiles.userId],
        references: [users.id],
    }),
}));

// 🎟️ 3. USER INVITATIONS
export const userInvitations = mysqlTable("user_invitations", {
    id: int("id").primaryKey().autoincrement().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: mysqlEnum("role", ['editor', 'reviewer']).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    invitedBy: varchar("invited_by", { length: 36 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
});

export const userInvitationsRelations = relations(userInvitations, ({ one }) => ({
    inviter: one(users, {
        fields: [userInvitations.invitedBy],
        references: [users.id],
    }),
}));

// 📄 4. SUBMISSIONS (CORE ENTITY)
export const submissions = mysqlTable("submissions", {
    id: int("id").primaryKey().autoincrement().notNull(),
    paperId: varchar("paper_id", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).unique(),
    
    // Status Flow
    status: mysqlEnum("status", [
        'submitted', 'editor_assigned', 'under_review', 
        'revision_requested', 'accepted', 'rejected', 
        'payment_pending', 'published'
    ]).default('submitted').notNull(),
    
    finalDecision: mysqlEnum("final_decision", ['accept', 'reject', 'withdrawn']),
    decisionAt: timestamp("decision_at"),
    decisionBy: varchar("decision_by", { length: 36 }).references(() => users.id),

    correspondingAuthorId: varchar("corresponding_author_id", { length: 36 }).notNull().references(() => users.id),
    issueId: int("issue_id").references(() => volumesIssues.id),
    submittedAt: timestamp("submitted_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
    deletedAt: timestamp("deleted_at"), // Standardized soft-delete
}, (table) => [
    index("status_idx").on(table.status),
    index("author_idx").on(table.correspondingAuthorId),
]);

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
    correspondingAuthor: one(users, {
        fields: [submissions.correspondingAuthorId],
        references: [users.id],
    }),
    decisionEditor: one(users, {
        fields: [submissions.decisionBy],
        references: [users.id],
    }),
    issue: one(volumesIssues, {
        fields: [submissions.issueId],
        references: [volumesIssues.id],
    }),
    versions: many(submissionVersions),
    authors: many(submissionAuthors),
    assignedEditors: many(submissionEditors),
    reviewAssignments: many(reviewAssignments),
    payment: one(payments, {
        fields: [submissions.id],
        references: [payments.submissionId],
    }),
    publication: one(publications, {
        fields: [submissions.id],
        references: [publications.submissionId],
    }),
}));

// 🔁 5. SUBMISSION VERSIONS (Holds the Content)
export const submissionVersions = mysqlTable("submission_versions", {
    id: int("id").primaryKey().autoincrement().notNull(),
    submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
    versionNumber: int("version_number").default(1).notNull(),
    
    // Title and Metadata stay here to track history
    title: text("title").notNull(),
    abstract: text("abstract"),
    keywords: text("keywords"),
    subjectArea: varchar("subject_area", { length: 255 }),
    
    changelog: text("changelog"), // Author's notes on changes
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    unique("submission_version_unique").on(table.submissionId, table.versionNumber),
]);

export const submissionVersionsRelations = relations(submissionVersions, ({ one, many }) => ({
    submission: one(submissions, {
        fields: [submissionVersions.submissionId],
        references: [submissions.id],
    }),
    files: many(submissionFiles),
    reviewAssignments: many(reviewAssignments),
}));

// 📂 6. SUBMISSION FILES
export const submissionFiles = mysqlTable("submission_files", {
    id: int("id").primaryKey().autoincrement().notNull(),
    versionId: int("version_id").notNull().references(() => submissionVersions.id, { onDelete: "cascade" }),
    fileType: mysqlEnum("file_type", ['main_manuscript', 'pdf_version','copyright_form','supplementary', 'feedback', 'payment_proof']).notNull(),
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    originalName: varchar("original_name", { length: 255 }),
    fileSize: int("file_size"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("file_version_idx").on(table.versionId),
]);

export const submissionFilesRelations = relations(submissionFiles, ({ one }) => ({
    version: one(submissionVersions, {
        fields: [submissionFiles.versionId],
        references: [submissionVersions.id],
    }),
}));

// 👥 7. SUBMISSION AUTHORS (Co-Authors)
export const submissionAuthors = mysqlTable("submission_authors", {
    id: int("id").primaryKey().autoincrement().notNull(),
    submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    designation: varchar("designation", { length: 255 }),
    institution: varchar("institution", { length: 500 }),
    isCorresponding: boolean("is_corresponding").default(false).notNull(),
    orderIndex: int("order_index").default(0).notNull(),
}, (table) => [
    index("sub_author_idx").on(table.submissionId),
    index("author_order_idx").on(table.submissionId, table.orderIndex),
]);

export const submissionAuthorsRelations = relations(submissionAuthors, ({ one }) => ({
    submission: one(submissions, {
        fields: [submissionAuthors.submissionId],
        references: [submissions.id],
    }),
}));

// 🎖️ 8. SUBMISSION EDITORS (Many-to-Many Assignment)
export const submissionEditors = mysqlTable("submission_editors", {
    submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
    editorId: varchar("editor_id", { length: 36 }).notNull().references(() => users.id),
    assignedAt: timestamp("assigned_at").defaultNow(),
}, (table) => [
    primaryKey({ columns: [table.submissionId, table.editorId] }),
]);

export const submissionEditorsRelations = relations(submissionEditors, ({ one }) => ({
    submission: one(submissions, {
        fields: [submissionEditors.submissionId],
        references: [submissions.id],
    }),
    editor: one(users, {
        fields: [submissionEditors.editorId],
        references: [users.id],
    }),
}));

// 🧪 9. REVIEW ASSIGNMENTS
export const reviewAssignments = mysqlTable("review_assignments", {
    id: int("id").primaryKey().autoincrement().notNull(),
    submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
    reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
    versionId: int("version_id").notNull().references(() => submissionVersions.id, { onDelete: "cascade" }),
    assignedBy: varchar("assigned_by", { length: 36 }).notNull().references(() => users.id),
    reviewRound: int("review_round").default(1).notNull(),
    status: mysqlEnum("status", ['assigned', 'accepted', 'declined', 'completed']).default('assigned').notNull(),
    deadline: date("deadline"),
    assignedAt: timestamp("assigned_at").defaultNow(),
    respondedAt: timestamp("responded_at"),
}, (table) => [
    unique("unique_assignment").on(table.submissionId, table.reviewerId, table.versionId, table.reviewRound),
]);

export const reviewAssignmentsRelations = relations(reviewAssignments, ({ one }) => ({
    submission: one(submissions, {
        fields: [reviewAssignments.submissionId],
        references: [submissions.id],
    }),
    reviewer: one(users, {
        fields: [reviewAssignments.reviewerId],
        references: [users.id],
    }),
    version: one(submissionVersions, {
        fields: [reviewAssignments.versionId],
        references: [submissionVersions.id],
    }),
    assigner: one(users, {
        fields: [reviewAssignments.assignedBy],
        references: [users.id],
    }),
    review: one(reviews, {
        fields: [reviewAssignments.id],
        references: [reviews.assignmentId],
    }),
}));

// 📝 10. REVIEWS (Detailed Feedback)
export const reviews = mysqlTable("reviews", {
    id: int("id").primaryKey().autoincrement().notNull(),
    assignmentId: int("assignment_id").notNull().references(() => reviewAssignments.id, { onDelete: "cascade" }).unique(),
    decision: mysqlEnum("decision", ['accept', 'minor_revision', 'major_revision', 'reject']).notNull(),
    score: int("score"),
    confidence: int("confidence"),
    commentsToAuthor: text("comments_to_author"),
    commentsToEditor: text("comments_to_editor"),
    createdAt: timestamp("created_at").defaultNow(),
    submittedAt: timestamp("submitted_at"),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
    assignment: one(reviewAssignments, {
        fields: [reviews.assignmentId],
        references: [reviewAssignments.id],
    }),
}));

// 💰 11. PAYMENTS
export const payments = mysqlTable("payments", {
    id: int("id").primaryKey().autoincrement().notNull(),
    submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }).unique(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default('INR').notNull(),
    status: mysqlEnum("status", ['pending', 'paid', 'verified', 'failed']).default('pending').notNull(),
    provider: varchar("provider", { length: 50 }),
    transactionId: varchar("transaction_id", { length: 255 }).unique(),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
    submission: one(submissions, {
        fields: [payments.submissionId],
        references: [submissions.id],
    }),
}));

// 📚 12. VOLUMES & ISSUES
export const volumesIssues = mysqlTable("volumes_issues", {
    id: int("id").primaryKey().autoincrement().notNull(),
    volumeNumber: int("volume_number").notNull(),
    issueNumber: int("issue_number").notNull(),
    year: int("year").notNull(),
    monthRange: varchar("month_range", { length: 100 }),
    status: mysqlEnum("status", ['open', 'published']).default('open').notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    unique("vol_issue_year").on(table.volumeNumber, table.issueNumber, table.year),
]);

export const volumesIssuesRelations = relations(volumesIssues, ({ many }) => ({
    submissions: many(submissions),
    publications: many(publications),
}));

// 📰 13. PUBLICATIONS
export const publications = mysqlTable("publications", {
    id: int("id").primaryKey().autoincrement().notNull(),
    submissionId: int("submission_id").notNull().references(() => submissions.id).unique(),
    issueId: int("issue_id").notNull().references(() => volumesIssues.id),
    finalPdfUrl: varchar("final_pdf_url", { length: 500 }).notNull(),
    startPage: int("start_page"),
    endPage: int("end_page"),
    doi: varchar("doi", { length: 100 }).unique(),
    publishedAt: timestamp("published_at").defaultNow(),
});

export const publicationsRelations = relations(publications, ({ one }) => ({
    submission: one(submissions, {
        fields: [publications.submissionId],
        references: [submissions.id],
    }),
    issue: one(volumesIssues, {
        fields: [publications.issueId],
        references: [volumesIssues.id],
    }),
}));

// 📩 14. APPLICATIONS (Reviewer/Editor Applicants)
export const applications = mysqlTable("applications", {
    id: int("id").primaryKey().autoincrement().notNull(),
    type: mysqlEnum("type", ['reviewer', 'editor']).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    designation: varchar("designation", { length: 255 }).notNull(),
    institute: varchar("institute", { length: 255 }).notNull(),
    status: mysqlEnum("status", ['pending', 'approved', 'rejected']).default('pending').notNull(),
    reviewedBy: varchar("reviewed_by", { length: 36 }).references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    unique("app_email_type_unique").on(table.email, table.type),
]);

export const applicationsRelations = relations(applications, ({ one }) => ({
    reviewer: one(users, {
        fields: [applications.reviewedBy],
        references: [users.id],
    }),
}));

// 📬 15. CONTACT & UX
export const contactMessages = mysqlTable("contact_messages", {
    id: int("id").primaryKey().autoincrement().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }),
    message: text("message").notNull(),
    status: mysqlEnum("status", ['pending', 'resolved', 'archived']).default('pending').notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = mysqlTable("notifications", {
    id: int("id").primaryKey().autoincrement().notNull(),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), 
    message: text("message").notNull(),
    actionLink: varchar("action_link", { length: 255 }),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("notif_user_idx").on(table.userId, table.isRead),
]);

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

// 📜 16. SYSTEM AUDIT
export const activityLogs = mysqlTable("activity_logs", {
    id: int("id").primaryKey().autoincrement().notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: int("entity_id").notNull(), // This is usually an ID but can be a UUID string too, maybe text is better?
    action: varchar("action", { length: 100 }).notNull(),
    performedBy: varchar("performed_by", { length: 36 }).references(() => users.id),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    performer: one(users, {
        fields: [activityLogs.performedBy],
        references: [users.id],
    }),
}));

export const settings = mysqlTable("settings", {
    settingKey: varchar("setting_key", { length: 100 }).primaryKey().notNull(),
    settingValue: text("setting_value"),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
