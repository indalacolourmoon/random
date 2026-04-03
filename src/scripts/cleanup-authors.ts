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

import { db } from "@/db";
import { sql } from "drizzle-orm";

async function cleanupStaleAuthors() {
    console.log("[Cleanup] Starting stale author deactivation...");

    try {
        const staleAuthors: any = await db.execute(sql`
            SELECT DISTINCT
                u.id as user_id,
                u.email,
                s.paper_id,
                s.status,
                DATEDIFF(NOW(), s.updated_at) as days_stale
            FROM submissions s
            JOIN users u ON s.corresponding_author_id = u.id
            WHERE s.status IN ('rejected', 'revision_requested')
              AND DATEDIFF(NOW(), s.updated_at) > 15
              AND u.is_active = true
              AND u.role = 'author'
        `);

        const authors = staleAuthors[0] || [];
        console.log(`[Cleanup] Found ${authors.length} stale author accounts.`);

        for (const author of authors) {
            await db.execute(sql`
                UPDATE users 
                SET is_active = false, 
                    invitation_token = NULL, 
                    invitation_expires = NULL 
                WHERE id = ${author.user_id}
            `);
            console.log(`[Cleanup] Deactivated: ${author.email} | Paper: ${author.paper_id} | Stale: ${author.days_stale} days`);
        }

        console.log(`[Cleanup] Done. ${authors.length} account(s) deactivated.`);
        process.exit(0);
    } catch (error) {
        console.error("[Cleanup] Error:", error);
        process.exit(1);
    }
}

cleanupStaleAuthors();
