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
import { eq, desc, and, sql, ne, inArray } from "drizzle-orm";
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
            issue: volumesIssues,
        })
        .from(publications)
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .orderBy(desc(publications.publishedAt));

        if (!rows.length) return { success: true, data: [] };

        const submissionIds = rows.map(r => r.submission?.id).filter(Boolean) as number[];

        // Fetch Authors and Versions separately to avoid complex joins and combinatorics
        const authorsList = await db.select().from(submissionAuthors)
            .where(inArray(submissionAuthors.submissionId, submissionIds))
            .orderBy(submissionAuthors.orderIndex);

        const versionsList = await db.select().from(submissionVersions)
            .where(inArray(submissionVersions.submissionId, submissionIds))
            .orderBy(desc(submissionVersions.versionNumber));

        const data = rows.map(row => {
            const paperAuthors = authorsList.filter(a => a.submissionId === row.submission?.id);
            const paperVersions = versionsList.filter(v => v.submissionId === row.submission?.id);
            
            return mapPublicationToUI({
                ...row.publication,
                submission: {
                    ...row.submission,
                    versions: paperVersions,
                    authors: paperAuthors
                },
                issue: row.issue
            });
        });

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
        const latestIssue = issues[0];

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            issue: volumesIssues,
        })
        .from(publications)
        .where(eq(publications.issueId, latestIssue.id))
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id));

        if (!rows.length) return { success: true, data: [] };

        const submissionIds = rows.map(r => r.submission?.id).filter(Boolean) as number[];

        const authorsList = await db.select().from(submissionAuthors)
            .where(inArray(submissionAuthors.submissionId, submissionIds))
            .orderBy(submissionAuthors.orderIndex);

        const versionsList = await db.select().from(submissionVersions)
            .where(inArray(submissionVersions.submissionId, submissionIds))
            .orderBy(desc(submissionVersions.versionNumber));

        const data = rows.map(row => {
            const paperAuthors = authorsList.filter(a => a.submissionId === row.submission?.id);
            const paperVersions = versionsList.filter(v => v.submissionId === row.submission?.id);
            
            return mapPublicationToUI({
                ...row.publication,
                submission: {
                    ...row.submission,
                    versions: paperVersions,
                    authors: paperAuthors
                },
                issue: row.issue
            });
        });

        return { success: true, data };
    } catch (error) {
        console.error("Get Latest Issue Papers Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function getArchivePapers(limit = 50, offset = 0): Promise<ActionResponse<PublishedPaperUI[]>> {
    try {
        const issues = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);

        const latestId = issues.length ? issues[0].id : -1;

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            issue: volumesIssues,
        })
        .from(publications)
        .where(ne(publications.issueId, latestId))
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .orderBy(desc(publications.publishedAt))
        .limit(limit)
        .offset(offset);

        if (!rows.length) return { success: true, data: [] };

        const submissionIds = rows.map(r => r.submission?.id).filter(Boolean) as number[];

        const authorsList = await db.select().from(submissionAuthors)
            .where(inArray(submissionAuthors.submissionId, submissionIds))
            .orderBy(submissionAuthors.orderIndex);

        const versionsList = await db.select().from(submissionVersions)
            .where(inArray(submissionVersions.submissionId, submissionIds))
            .orderBy(desc(submissionVersions.versionNumber));

        const data = rows.map(row => {
            const paperAuthors = authorsList.filter(a => a.submissionId === row.submission?.id);
            const paperVersions = versionsList.filter(v => v.submissionId === row.submission?.id);
            
            return mapPublicationToUI({
                ...row.publication,
                submission: {
                    ...row.submission,
                    versions: paperVersions,
                    authors: paperAuthors
                },
                issue: row.issue
            });
        });

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
    const sortedAuthors = [...authorsList].sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
    
    // Primary author is the one with isCorresponding or the first one
    const correspondingAuthor = sortedAuthors.find((a: any) => a.isCorresponding) || sortedAuthors[0];
    
    // Co-authors are all except the corresponding one, but user wants them ALL together?
    // "i want coauthor to display alogn side main author wiht comas ','"
    // So I will create a full string of names.
    const allAuthorsString = sortedAuthors.map((a: any) => a.name).join(', ');
    
    return {
        id: pub.submissionId || 0,
        paper_id: pub.submission?.paperId || "",
        title: latestVersion?.title || "Untitled Paper",
        abstract: latestVersion?.abstract || "",
        keywords: latestVersion?.keywords || "",
        author_name: allAuthorsString || "Anonymous Author",
        author_email: correspondingAuthor?.email || "N/A",
        affiliation: correspondingAuthor?.institution || "N/A",
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
        co_authors: null // We've bundled them into author_name per requirements
    };
}
