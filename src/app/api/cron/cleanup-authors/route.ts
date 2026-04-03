import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, inArray, lt, and, sql } from "drizzle-orm";
import { users, submissions, submissionVersions, submissionFiles } from "@/db/schema";
import fs from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Identify stale submissions (> 15 days, status = rejected/revision_requested)
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const staleSubmissions = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            authorId: submissions.correspondingAuthorId,
        })
        .from(submissions)
        .where(and(
            inArray(submissions.status, ['rejected', 'revision_requested']),
            lt(submissions.updatedAt, fifteenDaysAgo)
        ));

        if (staleSubmissions.length === 0) {
            return NextResponse.json({ deleted: 0, message: "No stale submissions found" });
        }

        const submissionIds = staleSubmissions.map(s => s.id);
        const authorIds = staleSubmissions.map(s => s.authorId);

        // 2. Fetch all file URLs for cleanup
        const filesToCleanup = await db.select({ url: submissionFiles.fileUrl })
            .from(submissionFiles)
            .innerJoin(submissionVersions, eq(submissionFiles.versionId, submissionVersions.id))
            .where(inArray(submissionVersions.submissionId, submissionIds));

        // 3. Delete files from disk
        for (const file of filesToCleanup) {
            try {
                const filePath = path.join(process.cwd(), "public", file.url);
                await fs.unlink(filePath);
            } catch (err) {
                console.error(`Failed to delete file ${file.url}:`, err);
            }
        }

        // 4. HARD DELETE (Cascades handles versions, files, assignments in schema)
        // Note: Authors table (users) needs to be deleted too
        await db.delete(submissions).where(inArray(submissions.id, submissionIds));
        await db.delete(users).where(and(inArray(users.id, authorIds), eq(users.role, 'author')));

        console.log(`Cleanup: hard-deleted ${submissionIds.length} stale submissions and authors.`);

        return NextResponse.json({
            deletedCount: submissionIds.length,
            deletedPapers: staleSubmissions.map(s => s.paperId),
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Cleanup Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

