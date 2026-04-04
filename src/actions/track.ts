"use server";
 
import { db } from "@/lib/db";
import { submissions, reviews, reviewAssignments, submissionVersions, userProfiles, users } from "@/db/schema";
import { eq, and, min, desc } from "drizzle-orm";
import { ActionResponse } from "@/db/types";
 
export async function trackManuscript(paperId: string, authorEmail?: string): Promise<ActionResponse<{ manuscript: any }>> {
    try {
        // 1. Get the submission and its latest version
        const result = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            submittedAt: submissions.submittedAt,
            updatedAt: submissions.updatedAt,
            title: submissionVersions.title,
            authorName: userProfiles.fullName,
            authorEmail: users.email,
        })
        .from(submissions)
        .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
        .innerJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .where(eq(submissions.paperId, paperId))
        .orderBy(desc(submissionVersions.versionNumber))
        .limit(1);
 
        const manuscriptRow = result[0];
 
        if (!manuscriptRow) {
            return { success: false, error: "No manuscript found with these credentials. Please check your Paper ID." };
        }
 
        // Logic for email verification if provided
        if (authorEmail && manuscriptRow.authorEmail.toLowerCase() !== authorEmail.toLowerCase()) {
            return { success: false, error: "Email verification failed. Please check the registered correspondent email." };
        }
 
        // 2. Get the review start date (min assigned_at from assignments)
        const assignments = await db.select({
            reviewStartedAt: min(reviewAssignments.assignedAt)
        })
        .from(reviewAssignments)
        .where(eq(reviewAssignments.submissionId, manuscriptRow.id));
 
        const manuscript: any = {
            ...manuscriptRow,
            review_started_at: assignments[0]?.reviewStartedAt,
            // Map to UI-friendly names (Historical compatibility)
            paper_id: manuscriptRow.paperId,
            submitted_at: manuscriptRow.submittedAt,
            updated_at: manuscriptRow.updatedAt,
            author_name: manuscriptRow.authorName,
            author_email: manuscriptRow.authorEmail,
        };
 
        // 3. If rejected, fetch reviewer feedback (commentsToAuthor)
        if (manuscript.status === 'rejected') {
            const feedbackRows = await db.select({ feedback: reviews.commentsToAuthor })
                .from(reviews)
                .innerJoin(reviewAssignments, eq(reviews.assignmentId, reviewAssignments.id))
                .where(
                    and(
                        eq(reviewAssignments.submissionId, manuscript.id),
                        eq(reviewAssignments.status, "completed")
                    )
                );
            manuscript.reviewer_feedback = feedbackRows.map(r => r.feedback).filter(Boolean);
        }
 
        return { success: true, data: { manuscript } };
    } catch (error) {
        console.error("Track Manuscript Error:", error);
        return { success: false, error: "An error occurred while fetching the status. Please try again later." };
    }
}
