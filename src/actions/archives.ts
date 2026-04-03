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
import { eq, desc, and, inArray } from "drizzle-orm";

/**
 * FETCH ALL PUBLISHED PAPERS
 * Used for the global archive list or sitemap
 */
export async function getPublishedPapers() {
    try {
        const publishedRaw = await db.query.publications.findMany({
            with: {
                submission: {
                    with: {
                        versions: {
                            orderBy: [desc(submissionVersions.versionNumber)],
                            limit: 1
                        },
                        correspondingAuthor: {
                            with: { profile: true }
                        },
                        authors: true
                    }
                },
                issue: true
            },
            orderBy: [desc(publications.publishedAt)]
        });

        return publishedRaw.map((pub: any) => mapPublicationToUI(pub));
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
        // 1. Find the latest 'open' or most recently 'published' issue
        const latestIssue = await db.query.volumesIssues.findFirst({
            where: eq(volumesIssues.status, 'open'),
            orderBy: [desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber)]
        });

        if (!latestIssue) return [];

        const papersRaw = await db.query.publications.findMany({
            where: eq(publications.issueId, latestIssue.id),
            with: {
                submission: {
                    with: {
                        versions: {
                            orderBy: [desc(submissionVersions.versionNumber)],
                            limit: 1
                        },
                        correspondingAuthor: {
                            with: { profile: true }
                        },
                        authors: true
                    }
                },
                issue: true
            }
        });

        return papersRaw.map((pub: any) => mapPublicationToUI(pub));
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
        const archiveRaw = await db.query.publications.findMany({
            with: {
                submission: {
                    with: {
                        versions: {
                            orderBy: [desc(submissionVersions.versionNumber)],
                            limit: 1
                        },
                        correspondingAuthor: {
                            with: { profile: true }
                        },
                        authors: true
                    }
                },
                issue: true
            },
            orderBy: [desc(publications.publishedAt)]
        });

        return archiveRaw.map((pub: any) => mapPublicationToUI(pub));
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
        const pub = await db.query.publications.findFirst({
            where: eq(publications.submissionId, parseInt(id)),
            with: {
                submission: {
                    with: {
                        versions: {
                            orderBy: [desc(submissionVersions.versionNumber)],
                            limit: 1
                        },
                        correspondingAuthor: {
                            with: { profile: true }
                        },
                        authors: true
                    }
                },
                issue: true
            }
        });

        return pub ? mapPublicationToUI(pub) : null;
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
