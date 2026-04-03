import {
    Plus,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import SubmissionContainer from '@/features/submissions/components/SubmissionContainer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import SubTabs from '@/features/submissions/components/SubmissionTabs';

import SubmissionStats from '@/features/submissions/components/SubmissionStats';

export const dynamic = 'force-dynamic';

export default async function Submissions({
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
            SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
            SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as underReview,
            SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM submissions
    `);
    const statsResult = statRows[0][0];

    // 2. Build SQL query dynamically
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

    let query = sql`
        SELECT s.*, 
        (SELECT COUNT(*) FROM reviews r WHERE r.submission_id = s.id AND r.status = 'completed') as completed_reviews 
        FROM submissions s
    `;

    if (conditions.length > 0) {
        query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`;
    }

    query = sql`${query} ORDER BY s.submitted_at DESC`;

    const rows: any = await db.execute(query);
    const submissions = rows[0] || [];

    return (
        <section className="space-y-12 pb-20 max-w-7xl 2xl:max-w-[1900px] mx-auto overflow-visible">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-primary/5 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 2xl:w-16 2xl:h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <Plus className="w-6 h-6 2xl:w-10 2xl:h-10 text-primary" />
                        </div>
                    <h1 className="font-serif font-semibold text-foreground tracking-tight capitalize leading-none text-2xl xl:text-3xl 2xl:text-4xl">
                        Manuscripts <span className="text-secondary opacity-50">registry</span>
                    </h1>
                </div>
                <p className="text-[9px] xl:text-xs 2xl:text-sm font-medium text-muted-foreground border-l-4 border-secondary/50 pl-6 py-1 max-w-2xl leading-relaxed capitalize tracking-wide">
                    Precision oversight of the global technical submission pipeline and peer-review integrity protocols.
                </p>
                </div>
                <div className="flex gap-4">
                    <Button asChild className="h-10 xl:h-12 2xl:h-14 px-8 xl:px-12 gap-3 bg-primary text-white dark:text-black font-semibold text-xs xl:text-sm capitalize tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-t border-white/20">
                        <Link className="cursor-pointer" href="/submit">
                            <Plus className="w-5 h-5 xl:w-6 xl:h-6" /> New submission
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Performance Overviews */}
            <SubmissionStats stats={statsResult} />

            {/* Main Content Area */}
            <Card className="border-primary/5 shadow-vip overflow-hidden bg-card">
                <CardContent className="p-0">
                    {/* Tabs Header */}
                    <div className="p-6 border-b border-primary/5 bg-primary/[0.01]">
                        <SubTabs currentStatus={currentStatus} />
                    </div>

                    {/* Integrated Submission Container handles Search and List */}
                    <SubmissionContainer
                        submissions={submissions}
                        currentStatus={currentStatus}
                        role="admin"
                    />

                    {/* Footer Stats */}
                    <div className="p-8 border-t border-primary/5 flex items-center justify-center bg-primary/[0.01]">
                        <p className="text-[9px] xl:text-xs font-semibold text-primary/20 tracking-widest capitalize">
                            Secure data segment end | {submissions.length} total records
                        </p>
                    </div>
                </CardContent>
            </Card>

            {submissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 bg-muted/20 border border-dashed border-border/50 rounded-xl space-y-6">
                    <AlertTriangle className="w-14 h-14 text-muted-foreground/20 mb-2" />
                    <p className="text-xs font-semibold text-muted-foreground tracking-[0.2em] uppercase">No active records in this database segment</p>
                </div>
            )}
        </section>
    );
}
