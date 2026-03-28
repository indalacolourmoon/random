import { relations } from "drizzle-orm/relations";
import { submissions, payments, reviews, users, volumesIssues } from "./schema";

export const paymentsRelations = relations(payments, ({ one }) => ({
    submission: one(submissions, {
        fields: [payments.submissionId],
        references: [submissions.id]
    }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
    payments: many(payments),
    reviews: many(reviews),
    volumesIssue: one(volumesIssues, {
        fields: [submissions.issueId],
        references: [volumesIssues.id]
    }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
    submission: one(submissions, {
        fields: [reviews.submissionId],
        references: [submissions.id]
    }),
    user: one(users, {
        fields: [reviews.reviewerId],
        references: [users.id]
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
    reviews: many(reviews),
}));

export const volumesIssuesRelations = relations(volumesIssues, ({ many }) => ({
    submissions: many(submissions),
}));
