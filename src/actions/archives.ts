"use server";

import { db } from "@/lib/db";
import { 
    publications, 
    submissions, 
    submissionAuthors,
    submissionVersions, 
    volumesIssues, 
    userProfiles
} from "@/db/schema";
import { eq, desc, and, sql, ne } from "drizzle-orm";
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
            authorProfile: userProfiles,
            author: submissionAuthors
        })
        .from(publications)
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .leftJoin(submissionAuthors, and(
            eq(submissions.id, submissionAuthors.submissionId),
            eq(submissionAuthors.isCorresponding, true) // Only lead author for lists
        ))
        .orderBy(desc(publications.publishedAt));

        const data = rows.map((row) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile },
                authors: row.author ? [row.author] : []
            },
            issue: row.issue
        }));
        return { success: true, data };
    } catch (error) {
        console.error("Get Published Papers Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function getLatestIssuePapers(): Promise<ActionResponse<PublishedPaperUI[]>> {
    try {
        const issues = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);

        if (!issues.length) return { success: true, data: [] };
        const latestIssueId = issues[0].id;

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            version: submissionVersions,
            issue: volumesIssues,
            authorProfile: userProfiles,
            author: submissionAuthors
        })
        .from(publications)
        .where(eq(publications.issueId, latestIssueId))
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .leftJoin(submissionAuthors, and(
            eq(submissions.id, submissionAuthors.submissionId),
            eq(submissionAuthors.isCorresponding, true)
        ));

        const data = rows.map((row) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile },
                authors: row.author ? [row.author] : []
            },
            issue: row.issue
        }));
        return { success: true, data };
    } catch (error) {
        console.error("Get Latest Issue Papers Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function getArchivePapers(limit = 50, offset = 0): Promise<ActionResponse<PublishedPaperUI[]>> {
    try {
        // Find latest issue to exclude it
        const latestIssue = await db.select({ id: volumesIssues.id })
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);

        const latestId = latestIssue.length ? latestIssue[0].id : -1;

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            version: submissionVersions,
            issue: volumesIssues,
            authorProfile: userProfiles,
            author: submissionAuthors
        })
        .from(publications)
        .where(ne(publications.issueId, latestId)) // Exclude current issue
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .leftJoin(submissionAuthors, and(
            eq(submissions.id, submissionAuthors.submissionId),
            eq(submissionAuthors.isCorresponding, true)
        ))
        .orderBy(desc(publications.publishedAt))
        .limit(limit)
        .offset(offset);

        const data = rows.map((row) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile },
                authors: row.author ? [row.author] : []
            },
            issue: row.issue
        }));
        return { success: true, data };
    } catch (error) {
        console.error("Get Archive Papers Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

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
        if (!row || !row.submission) return { success: false, error: "Paper data is incomplete" };

        // SECOND QUERY: Fetch all authors separately for the detail view
        const authorsList = await db.select()
            .from(submissionAuthors)
            .where(eq(submissionAuthors.submissionId, row.submission.id))
            .orderBy(submissionAuthors.orderIndex);

        const data = mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile },
                authors: authorsList
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
        updatedAt?: Date | null;
        authors?: any;
        versions?: Array<{ title?: string | null; abstract?: string | null; keywords?: string | null } | null>;
        correspondingAuthor?: { 
            profile?: { 
                fullName?: string | null,
                institute?: string | null 
            } | null 
        } | null;
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
    const authorsList = Array.isArray(pub.submission?.authors) ? pub.submission.authors : [];
    
    // Sort authors by orderIndex
    const sortedAuthors = authorsList.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
    
    // Primary author info
    const correspondingAuthor = sortedAuthors.find((a: any) => a.isCorresponding) || sortedAuthors[0];
    const otherAuthors = sortedAuthors.filter((a: any) => a !== correspondingAuthor);
    
    return {
        id: pub.submissionId || 0,
        paper_id: pub.submission?.paperId || "",
        title: latestVersion?.title || "Untitled Paper",
        abstract: latestVersion?.abstract || "",
        keywords: latestVersion?.keywords || "",
        author_name: correspondingAuthor?.name || pub.submission?.correspondingAuthor?.profile?.fullName || "Anonymous Author",
        author_email: correspondingAuthor?.email || "N/A",
        affiliation: correspondingAuthor?.institution || pub.submission?.correspondingAuthor?.profile?.institute || "N/A",
        status: pub.submission?.status || "published",
        doi: pub.doi || "",
        file_path: pub.finalPdfUrl || "",
        pdf_url: pub.finalPdfUrl || "",
        start_page: pub.startPage || null,
        end_page: pub.endPage || null,
        page_range: pub.startPage && pub.endPage ? `${pub.startPage}-${pub.endPage}` : null,
        published_at: pub.publishedAt ? pub.publishedAt.toISOString() : null,
        updated_at: pub.submission?.updatedAt ? pub.submission.updatedAt.toISOString() : pub.publishedAt ? pub.publishedAt.toISOString() : null,
        volume_number: pub.issue?.volumeNumber || 0,
        issue_number: pub.issue?.issueNumber || 0,
        publication_year: pub.issue?.year || 0,
        month_range: pub.issue?.monthRange || "",
        co_authors: otherAuthors.length > 0 ? JSON.stringify(otherAuthors) : null
    };
}
