import {
    Plus,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import SubmissionContainer from '@/features/submissions/components/SubmissionContainer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import pool from '@/lib/db';
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
    const [statRows]: any = await pool.execute(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
            SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as underReview,
            SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM submissions
    `);
    const statsResult = statRows[0];

    // 2. Build SQL query dynamically
    const conditions = [];
    const params: any[] = [];

    if (currentStatus === 'pending') {
        conditions.push('s.status IN ("under_review", "accepted")');
    } else if (currentStatus !== 'all') {
        conditions.push('s.status = ?');
        params.push(currentStatus);
    }

    if (q) {
        conditions.push('(s.paper_id LIKE ? OR s.title LIKE ? OR s.author_name LIKE ?)');
        const searchVal = `%${q}%`;
        params.push(searchVal, searchVal, searchVal);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
        SELECT s.*, 
        (SELECT COUNT(*) FROM reviews r WHERE r.submission_id = s.id AND r.status = 'completed') as completed_reviews 
        FROM submissions s
        ${whereClause}
        ORDER BY s.submitted_at DESC
    `;

    const [rows]: any = await pool.execute(query, params);
    const submissions = rows;

    return (
        <section className="space-y-12 pb-20 max-w-7xl 2xl:max-w-[1900px] mx-auto overflow-visible">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-primary/5 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 2xl:w-16 2xl:h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <Plus className="w-6 h-6 2xl:w-10 2xl:h-10 text-primary" />
                        </div>
                        <h1 className="font-serif font-black text-foreground tracking-tighter uppercase leading-none text-3xl xl:text-4xl 2xl:text-6xl">
                            Manuscripts <span className="text-secondary opacity-50">Registry</span>
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm 2xl:text-2xl font-bold text-muted-foreground border-l-4 border-secondary/50 pl-6 py-1 max-w-2xl leading-relaxed">
                        Precision oversight of the global technical submission pipeline and peer-review integrity protocols.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button asChild className="h-14 2xl:h-20 px-12 2xl:px-20 gap-4 bg-primary text-white dark:text-black font-black text-[10px] 2xl:text-2xl tracking-[0.3em] rounded-2xl 2xl:rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-t border-white/20">
                        <Link className="cursor-pointer" href="/submit">
                            <Plus className="w-6 h-6 2xl:w-10 2xl:h-10" /> New Submission
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
                        <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-sm font-black text-primary/20 tracking-[0.4em] uppercase">
                            Secure Data Segment End | {submissions.length} Total Records
                        </p>
                    </div>
                </CardContent>
            </Card>

            {submissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 bg-muted/20 border border-dashed border-border/50 rounded-xl space-y-6">
                    <AlertTriangle className="w-14 h-14 text-muted-foreground/20 mb-2" />
                    <p className="text-xs font-black text-muted-foreground tracking-[0.2em] uppercase">No active records in this database segment</p>
                </div>
            )}
        </section>
    );
}
