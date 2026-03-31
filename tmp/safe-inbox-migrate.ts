import pool from "../src/lib/db";

async function migrate() {
    console.log("🚀 Starting data mapping migration for contact_messages...");
    
    try {
        // 1. Add new enum values temporarily
        console.log("Step 1: Expanding ENUM to include both old and new values...");
        await pool.execute("ALTER TABLE `contact_messages` MODIFY COLUMN `status` enum('unread','read','archived','pending','resolved') NOT NULL DEFAULT 'unread'");
        
        // 2. Map data
        console.log("Step 2: Mapping 'unread' -> 'pending' and 'read' -> 'resolved'...");
        await pool.execute("UPDATE `contact_messages` SET status = 'pending' WHERE status = 'unread'");
        await pool.execute("UPDATE `contact_messages` SET status = 'resolved' WHERE status = 'read'");
        
        // 3. Finalize new ENUM and add columns (Matching the generated migration)
        console.log("Step 3: Finalizing schema...");
        await pool.execute("ALTER TABLE `contact_messages` MODIFY COLUMN `status` enum('pending','resolved','archived') NOT NULL DEFAULT 'pending'");
        
        // Check if columns exist before adding
        const [columns]: any = await pool.execute("SHOW COLUMNS FROM `contact_messages` LIKE 'resolved_at'");
        if (columns.length === 0) {
            await pool.execute("ALTER TABLE `contact_messages` ADD `resolved_at` timestamp NULL");
            await pool.execute("ALTER TABLE `contact_messages` ADD `resolved_by` int NULL");
            await pool.execute("ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_resolved_by_users_id_fk` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE");
            await pool.execute("CREATE INDEX `msg_status_idx` ON `contact_messages` (`status`)").catch(() => {});
            await pool.execute("CREATE INDEX `resolved_by_msg_idx` ON `contact_messages` (`resolved_by`)").catch(() => {});
        }
        
        console.log("✅ Migration complete! Data preserved and schema modernized.");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        process.exit(0);
    }
}

migrate();
