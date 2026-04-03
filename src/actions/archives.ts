"use server";

import { db } from "@/lib/db";
import { 
    publications, 
    submissions, 
    submissionVersions, 
    volumesIssues, 
    userProfiles,
    users
} from "@/db/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";

/**
 * FETCH ALL PUBLISHED PAPERS
 * Used for the global archive list or sitemap
 */
export async function getPublishedPapers() {
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

        return rows.map((row: any) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile }
            },
            issue: row.issue
        }));
    } catch (error: any) {
        console.error("Get Published Papers Error:", error);
        return [];
    }
}

/**
 * FETCH PAPERS FOR THE CURRENT/LATEST ISSUE
 */
export async function getLatestIssuePapers() {
    try {
        const latestIssue = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'open'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);

        if (!latestIssue.length) return [];

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

        return rows.map((row: any) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile }
            },
            issue: row.issue
        }));
    } catch (error: any) {
        console.error("Get Latest Issue Papers Error:", error);
        return [];
    }
}

/**
 * FETCH PAPERS FOR THE ARCHIVE (Historical Issues)
 */
export async function getArchivePapers() {
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

        return rows.map((row: any) => mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile }
            },
            issue: row.issue
        }));
    } catch (error) {
        console.error("Get Archive Papers Error:", error);
        return [];
    }
}

/**
 * FETCH SINGLE PAPER BY UUID OR SLUG
 */
export async function getPaperById(id: string) {
    try {
        const rows = await db.select({
            publication: publications,
            submission: submissions,
            version: submissionVersions,
            issue: volumesIssues,
            authorProfile: userProfiles
        })
        .from(publications)
        .where(eq(publications.submissionId, parseInt(id)))
        .leftJoin(submissions, eq(publications.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, sql`(SELECT MAX(version_number) FROM submission_versions WHERE submission_id = ${submissions.id})`)
        ))
        .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .limit(1);

        const row = rows[0];
        if (!row) return null;

        return mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile }
            },
            issue: row.issue
        });
    } catch (error) {
        console.error("Get Paper By ID Error:", error);
        return null;
    }
}

/**
 * HELPER: Map relational Drizzle structure to the flat structure the UI expects
 */
function mapPublicationToUI(pub: any) {
    const latestVersion = pub.submission?.versions?.[0];
    return {
        id: pub.submissionId,
        paper_id: pub.submission?.paperId,
        title: latestVersion?.title || "Untitled Paper",
        abstract: latestVersion?.abstract || "",
        keywords: latestVersion?.keywords || "",
        author_name: pub.submission?.correspondingAuthor?.profile?.fullName || "Anonymous Author",
        status: pub.submission?.status,
        doi: pub.doi,
        file_path: pub.finalPdfUrl,
        pdf_url: pub.finalPdfUrl,
        start_page: pub.startPage,
        end_page: pub.endPage,
        page_range: pub.startPage && pub.endPage ? `${pub.startPage}-${pub.endPage}` : null,
        published_at: pub.publishedAt,
        volume_number: pub.issue?.volumeNumber,
        issue_number: pub.issue?.issueNumber,
        publication_year: pub.issue?.year,
        month_range: pub.issue?.monthRange,
        co_authors: pub.submission?.authors?.map((a: any) => a.name).join(', ')
    };
}
