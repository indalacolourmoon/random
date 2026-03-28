
const mysql = require('mysql2/promise');

async function debug() {
    const connection = await mysql.createConnection({
        host: 'srv2186.hstgr.io',
        user: 'u116573049_ijite',
        password: 'Ijitest@2026',
        database: 'u116573049_ijite',
        port: 3306
    });

    console.log("--- Latest issues ordered by year, volume, issue ---");
    const [issues] = await connection.execute("SELECT id, volume_number, issue_number, year, month_range, status FROM volumes_issues WHERE status = 'published' ORDER BY year DESC, volume_number DESC, issue_number DESC LIMIT 5");
    console.log(JSON.stringify(issues, null, 2));

    console.log("\n--- Most recently updated published papers ---");
    const [papers] = await connection.execute(`
        SELECT s.id, s.title, s.issue_id, s.updated_at, vi.year, vi.issue_number, vi.month_range 
        FROM submissions s 
        JOIN volumes_issues vi ON s.issue_id = vi.id 
        WHERE s.status = 'published' 
        ORDER BY s.updated_at DESC LIMIT 10
    `);
    console.log(JSON.stringify(papers, null, 2));

    await connection.end();
}

debug().catch(console.error);
