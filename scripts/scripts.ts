import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../src/db";
import * as schema from "../src/db/schema";
import { sql } from "drizzle-orm";

async function main() {
    const command = process.argv[2];

    try {
        switch (command) {
            case "test":
                console.log("🔍 Testing database connection...");
                const userCount = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
                console.log("✅ Connection successful.");
                console.log("📊 Stats:", { users: userCount[0]?.count ?? 0 });
                break;

            case "inspect":
                console.log("🕵️  Inspecting schema tables...");
                const tables = Object.keys(schema).filter(key => key !== 'default');
                console.log("🗂️  Found tables:", tables.join(", "));
                break;

            case "seed":
                console.log("🌱 Seeding functionality placeholder...");
                // Add seeding logic here
                break;
            
            case "desc":
                const tableName = process.argv[3] || "submissions";
                console.log(`📋 Describing table: ${tableName}...`);
                const [cols]: any = await db.execute(sql.raw(`DESCRIBE \`${tableName}\``));
                console.table(cols);
                break;

            case "migrate":
                console.log("🚀 Running manual migration for submission_mode...");
                try {
                    await db.execute(sql.raw("ALTER TABLE `submissions` ADD `start_page` int"));
                    console.log("✅ Added start_page column.");
                } catch (e: any) { console.log(`ℹ️ start_page: ${e.code || e.message}`); }

                try {
                    await db.execute(sql.raw("ALTER TABLE `submissions` ADD `end_page` int"));
                    console.log("✅ Added end_page column.");
                } catch (e: any) { console.log(`ℹ️ end_page: ${e.code || e.message}`); }

                try {
                    await db.execute(sql.raw("ALTER TABLE `submissions` ADD `submission_mode` enum('current','archive') DEFAULT 'archive'"));
                    console.log("✅ Added submission_mode column.");
                } catch (e: any) { console.log(`ℹ️ submission_mode: ${e.code || e.message}`); }
                break;

            case "nuke":
                console.log("⚠️  Nuking database (dropping all tables)...");
                const [tablesToDrop]: any = await db.execute(sql`SHOW TABLES`);
                const tableNames = tablesToDrop.map((row: any) => Object.values(row)[0]);

                if (tableNames.length === 0) {
                    console.log("✅ Database is already empty.");
                } else {
                    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
                    for (const name of tableNames) {
                        console.log(`🗑️  Dropping table: ${name}`);
                        await db.execute(sql.raw(`DROP TABLE \`${name}\``));
                    }
                    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
                    console.log("✅ Database nuked successfully.");
                }
                break;

            case "sync-modes":
                console.log("🔄 Syncing submission modes...");
                // 1. Find the latest published issue
                const latestIssue = await db.select({
                    id: schema.volumesIssues.id,
                })
                    .from(schema.volumesIssues)
                    .where(sql`${schema.volumesIssues.status} = 'published'`)
                    .orderBy(sql`${schema.volumesIssues.year} DESC, ${schema.volumesIssues.volumeNumber} DESC, ${schema.volumesIssues.issueNumber} DESC`)
                    .limit(1);

                if (latestIssue.length === 0) {
                    console.log("⚠️ No published issues found. Skipping sync.");
                    break;
                }

                const currentIssueId = latestIssue[0].id;
                console.log(`📌 Current Issue ID identified: ${currentIssueId}`);

                // 2. Set all papers in this issue to 'current'
                await db.update(schema.submissions)
                    .set({ submissionMode: 'current' })
                    .where(sql`${schema.submissions.issueId} = ${currentIssueId} AND ${schema.submissions.status} = 'published'`);

                // 3. Set all other papers to 'archive'
                await db.update(schema.submissions)
                    .set({ submissionMode: 'archive' })
                    .where(sql`${schema.submissions.issueId} <> ${currentIssueId} AND ${schema.submissions.status} = 'published'`);

                console.log("✅ Submission modes synchronized successfully.");
                break;

            default:
                console.log("❓ Unknown command. Available: test, inspect, seed, nuke, sync-modes");
        }
    } catch (error) {
        console.error("❌ Error executing command:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Execute main function
main().catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
});
