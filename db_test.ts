import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
        console.log("Checking submissions...");
        const [submissions]: any = await pool.query('SELECT id, paper_id, status, submission_mode, issue_id FROM submissions WHERE paper_id = "IJITEST-2026-001"');
        console.log("Submission found:", submissions);

        if (submissions.length > 0) {
            console.log("\nChecking volumes_issues for issue_id =", submissions[0].issue_id);
            const [issues]: any = await pool.query('SELECT * FROM volumes_issues WHERE id = ?', [submissions[0].issue_id]);
            console.log("Issue found:", issues);
            
            console.log("\nRunning the exact query from getArchivePapers()...");
            const [rows]: any = await pool.query(`
                SELECT 
                    s.id, s.paper_id, s.status, s.submission_mode,
                    vi.volume_number, 
                    vi.issue_number 
                FROM submissions s
                JOIN volumes_issues vi ON s.issue_id = vi.id
                WHERE s.status = 'published' 
                AND s.submission_mode = 'archive'
            `);
            console.log("Archive query returned rows:", rows.length);
            console.log(rows);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkDb();
