"use server";

import { db } from "@/lib/db";
import { 
    publications, 
    submissions, 
    submissionVersions, 
    volumesIssues, 
    userProfiles
} from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { type PublishedPaperUI, type ActionResponse } from "@/db/types";

/**
 * FETCH ALL PUBLISHED PAPERS
 * Used for the global archive list or sitemap
 */
export async function getPublishedPapers(): Promise<ActionResponse<PublishedPaperUI[]>> {
    try {
        const rows = await db.select({
            publication: publications,
            submission: submissions,
            version: submissionVersions,
            issue: volumesIssues,
            authorProfile: userProfiles
        })
        .from(publications)
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .orderBy(desc(publications.publishedAt));

        const data = rows.map((row) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile }
            },
            issue: row.issue
        }));
        return { success: true, data };
    } catch (error) {
        console.error("Get Published Papers Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * FETCH PAPERS FOR THE CURRENT/LATEST ISSUE
 */
export async function getLatestIssuePapers(): Promise<ActionResponse<PublishedPaperUI[]>> {
    try {
        const latestIssue = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'open'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);

        if (!latestIssue.length) return { success: true, data: [] };

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            version: submissionVersions,
            issue: volumesIssues,
            authorProfile: userProfiles
        })
        .from(publications)
        .where(eq(publications.issueId, latestIssue[0].id))
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId));

        const data = rows.map((row) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile }
            },
            issue: row.issue
        }));
        return { success: true, data };
    } catch (error) {
        console.error("Get Latest Issue Papers Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * FETCH PAPERS FOR THE ARCHIVE (Historical Issues)
 */
export async function getArchivePapers(): Promise<ActionResponse<PublishedPaperUI[]>> {
    try {
        const rows = await db.select({
            publication: publications,
            submission: submissions,
            version: submissionVersions,
            issue: volumesIssues,
            authorProfile: userProfiles
        })
        .from(publications)
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .orderBy(desc(publications.publishedAt));

        const data = rows.map((row) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile }
            },
            issue: row.issue
        }));
        return { success: true, data };
    } catch (error) {
        console.error("Get Archive Papers Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * FETCH SINGLE PAPER BY UUID OR SLUG
 */
export async function getPaperById(id: string): Promise<ActionResponse<PublishedPaperUI>> {
    try {
        const numericId = Number(id);
        const whereClause = isNaN(numericId)
            ? eq(submissions.paperId, id)
            : eq(publications.submissionId, numericId);

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            version: submissionVersions,
            issue: volumesIssues,
            authorProfile: userProfiles
        })
        .from(publications)
        .where(whereClause)
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .limit(1);

        const row = rows[0];
        if (!row) return { success: false, error: "Paper not found" };

        const data = mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile }
            },
            issue: row.issue
        });
        return { success: true, data };
    } catch (error) {
        console.error("Get Paper By ID Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * HELPER: Map relational Drizzle structure to the flat structure the UI expects
 */
interface PublicationInput {
    submissionId?: number | null;
    doi?: string | null;
    finalPdfUrl?: string | null;
    startPage?: number | null;
    endPage?: number | null;
    publishedAt?: Date | null;
    submission?: {
        paperId?: string | null;
        status?: string | null;
        authors?: unknown;
        versions?: Array<{ title?: string | null; abstract?: string | null; keywords?: string | null } | null>;
        correspondingAuthor?: { profile?: { fullName?: string | null } | null };
    } | null;
    issue?: {
        volumeNumber?: number | null;
        issueNumber?: number | null;
        year?: number | null;
        monthRange?: string | null;
    } | null;
}

function mapPublicationToUI(pub: PublicationInput): PublishedPaperUI {
    const latestVersion = pub.submission?.versions?.[0];
    let authorsStr = "";
    if (pub.submission?.authors && Array.isArray(pub.submission.authors)) {
        authorsStr = pub.submission.authors.map((a: unknown) => (a as { name?: string }).name).filter(Boolean).join(', ');
    }

    return {
        id: pub.submissionId || 0,
        paper_id: pub.submission?.paperId || "",
        title: latestVersion?.title || "Untitled Paper",
        abstract: latestVersion?.abstract || "",
        keywords: latestVersion?.keywords || "",
        author_name: pub.submission?.correspondingAuthor?.profile?.fullName || "Anonymous Author",
        status: pub.submission?.status || "published",
        doi: pub.doi || "",
        file_path: pub.finalPdfUrl || "",
        pdf_url: pub.finalPdfUrl || "",
        start_page: pub.startPage || null,
        end_page: pub.endPage || null,
        page_range: pub.startPage && pub.endPage ? `${pub.startPage}-${pub.endPage}` : null,
        published_at: pub.publishedAt ? pub.publishedAt.toISOString() : "",
        volume_number: pub.issue?.volumeNumber || 0,
        issue_number: pub.issue?.issueNumber || 0,
        publication_year: pub.issue?.year || 0,
        month_range: pub.issue?.monthRange || "",
        co_authors: authorsStr
    };
}
