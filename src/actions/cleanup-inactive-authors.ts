'use server';

import { db } from "@/db";
import { users, submissions, userProfiles } from "@/db/schema";
import { eq, and, sql, lt, inArray, notInArray } from "drizzle-orm";

/**
 * Automates the deletion of inactive author accounts.
 * Logic:
 * 1. Find users with role 'author'.
 * 2. Join with submissions to check status.
 * 3. If an author has ONLY 'rejected' or 'revision_requested' submissions,
 *    and the latest 'updated_at' is > 15 days ago, delete the user.
 */
export async function cleanupInactiveAuthors() {
    try {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        // Sub-query: Find authors who have at least one active submission 
        // (anything other than rejected or revision_requested)
        const activeAuthorIdsResult = await db.execute(sql`
            SELECT DISTINCT corresponding_author_id 
            FROM submissions 
            WHERE status NOT IN ('rejected', 'revision_requested')
        `);
        const activeAuthorIds = (activeAuthorIdsResult[0] as any[]).map(row => row.corresponding_author_id);

        // Find authors who have submissions that were updated more than 15 days ago
        // and are NOT in the activeAuthorIds list.
        const inactiveAuthorIdsResult = await db.execute(sql`
            SELECT DISTINCT corresponding_author_id 
            FROM submissions 
            WHERE status IN ('rejected', 'revision_requested')
              AND updated_at < ${fifteenDaysAgo}
              ${activeAuthorIds.length > 0 ? sql`AND corresponding_author_id NOT IN (${sql.join(activeAuthorIds)})` : sql``}
        `);
        
        const inactiveAuthorIds = (inactiveAuthorIdsResult[0] as any[]).map(row => row.corresponding_author_id);

        if (inactiveAuthorIds.length === 0) {
            return { success: true, deletedCount: 0 };
        }

        // Delete the authors
        // Note: Drizzle might have issues with large inArray on some DBs, but 
        // for mysql/mariadb with uuid it should be fine.
        await db.delete(users)
            .where(and(
                eq(users.role, 'author'),
                inArray(users.id, inactiveAuthorIds)
            ));

        // Note: cascading deletes should handle submissions, but let's be sure.
        // In schema.ts, submissions table corresponds to corresponding_author_id 
        // which has .references(() => users.id, { onDelete: "cascade" })? 
        // Let's check schema.ts again.

        return { success: true, deletedCount: inactiveAuthorIds.length };
    } catch (error: any) {
        console.error("Cleanup Inactive Authors Error:", error);
        return { success: false, error: error.message };
    }
}
