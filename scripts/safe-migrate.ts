import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

async function runSafeMigration() {
    console.log("🚀 Starting Safe Migration for Phase 4 Academic Features...");

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    const connection = await pool.getConnection();

    try {
        const migrationPath = path.join(process.cwd(), 'drizzle', '0006_kind_khan.sql');
        const sqlContent = await fs.readFile(migrationPath, 'utf8');
        
        // Split by statement-breakpoint or semicolon
        const statements = sqlContent
            .split(/--> statement-breakpoint|;/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} migration statements.`);

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await connection.execute(statement);
        }

        console.log("✅ Migration successful! Database schema is now updated.");
    } catch (error: any) {
        if (error.code === 'ER_DUP_COLUMN_NAME' || error.code === 'ER_DUP_ENTRY') {
            console.warn("⚠️ Warning: Migration partially applied or columns already exist. Continuing...");
        } else {
            console.error("❌ Migration failed:", error.message);
            process.exit(1);
        }
    } finally {
        connection.release();
        await pool.end();
    }
}

runSafeMigration();
