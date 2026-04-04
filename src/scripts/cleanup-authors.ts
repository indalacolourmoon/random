/**
 * Cleanup Authors Script
 *
 * Deactivates author accounts where:
 * - Their submission status is 'rejected' or 'revision_requested'
 * - The status has not changed for more than 15 days (no resubmission made)
 *
 * Run via: npx ts-node src/scripts/cleanup-authors.ts
 * Or trigger via API: GET /api/cron/cleanup-authors (with Authorization: Bearer CRON_SECRET)
 */

import { db } from "@/lib/db";
import { sql, eq, inArray, and } from "drizzle-orm";
import { users, submissions } from "@/db/schema";

async function cleanupStaleAuthors() {
    console.log("[Cleanup] Starting stale author deactivation...");

    try {
        const staleAuthors = await db.select({
            id: users.id,
            email: users.email,
            paperId: submissions.paperId,
            status: submissions.status,
            updatedAt: submissions.updatedAt
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .where(and(
            inArray(submissions.status, ['rejected', 'revision_requested']),
            sql`DATEDIFF(NOW(), ${submissions.updatedAt}) > 15`,
            eq(users.isActive, true),
            eq(users.role, 'author')
        ));

        console.log(`[Cleanup] Found ${staleAuthors.length} stale author accounts.`);

        for (const author of staleAuthors) {
            await db.update(users)
                .set({ isActive: false })
                .where(eq(users.id, author.id));
            
            console.log(`[Cleanup] Deactivated: ${author.email} | Paper: ${author.paperId}`);
        }

        console.log(`[Cleanup] Done. ${staleAuthors.length} account(s) deactivated.`);
        process.exit(0);
    } catch (error) {
        console.error("[Cleanup] Error:", error);
        process.exit(1);
    }
}

cleanupStaleAuthors();
