import { db } from '@/db';
import { sql } from 'drizzle-orm';
import SubmissionRegistry from '@/features/submissions/components/SubmissionRegistry';

export const dynamic = 'force-dynamic';

export default async function EditorSubmissions({
    searchParams
}: {
    searchParams: Promise<{ status?: string, q?: string }>
}) {
    const { status, q } = await searchParams;
    const currentStatus = status || 'all';

    // 1. Fetch Stats Aggregation
    const statRows: any = await db.execute(sql`
        SELECT 
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END), 0) as submitted,
            COALESCE(SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END), 0) as underReview,
            COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) as published,
            COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM submissions
    `);

    const statsResult = (statRows?.[0]?.[0]) || {
        total: 0,
        submitted: 0,
        underReview: 0,
        published: 0,
        rejected: 0
    };

    // 2. Build SQL conditions
    const conditions: any[] = [];
    if (currentStatus === 'pending') {
        conditions.push(sql`s.status IN ("under_review", "accepted")`);
    } else if (currentStatus !== 'all') {
        conditions.push(sql`s.status = ${currentStatus}`);
    }

    if (q) {
        const searchVal = `%${q}%`;
        conditions.push(sql`(s.paper_id LIKE ${searchVal} OR s.title LIKE ${searchVal} OR s.author_name LIKE ${searchVal})`);
    }

    // 3. Build and execute query (using fixed review_assignments join)
    let query = sql`
        SELECT s.*, 
        (SELECT COUNT(*) FROM review_assignments ra WHERE ra.submission_id = s.id AND ra.status = 'completed') as completed_reviews 
        FROM submissions s
    `;

    if (conditions.length > 0) {
        query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`;
    }

    query = sql`${query} ORDER BY s.submitted_at DESC`;

    const rows: any = await db.execute(query);
    const submissions = rows[0] || [];

    return (
        <SubmissionRegistry 
            role="editor" 
            submissions={submissions} 
            stats={statsResult} 
            currentStatus={currentStatus} 
        />
    );
}
