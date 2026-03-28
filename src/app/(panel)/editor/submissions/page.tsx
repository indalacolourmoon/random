import { Plus, AlertTriangle } from 'lucide-react';
import pool from '@/lib/db';
import Link from 'next/link';
import SubmissionContainer from '@/features/submissions/components/SubmissionContainer';
import SubmissionTabs from '@/features/submissions/components/SubmissionTabs';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function Submissions({
    searchParams
}: {
    searchParams: Promise<{ status?: string, q?: string }>
}) {
    const { status, q } = await searchParams;
    const currentStatus = status || 'all';

    // Build SQL query dynamically
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
        <section className="space-y-6 pb-20">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                <div className="space-y-2">
                    <h1 className=" font-black text-foreground tracking-widest uppercase leading-none 2xl:text-3xl">Manuscripts Registry</h1>
                    <p className="text-xs sm:text-sm 2xl:text-lg font-medium text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2 transition-all duration-500">Editorial pipeline & lifecycle oversight for current journal cycle.</p>
                </div>
                <div className="flex gap-4">
                    <Button asChild className="h-12 2xl:h-14 px-10 gap-3 bg-primary text-white dark:text-black font-black text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-base tracking-[0.3em] rounded-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                        <Link className="cursor-pointer" href="/submit">
                            <Plus className="w-6 h-6 2xl:w-6 2xl:h-6" /> Add Manuscript
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <Card className="border-primary/5 shadow-vip overflow-hidden bg-card">
                <CardContent className="p-0">
                    {/* Tabs Header */}
                    <div className="p-6 border-b border-primary/5 bg-primary/[0.01]">
                        <SubmissionTabs currentStatus={currentStatus} />
                    </div>

                    {/* Integrated Submission Container handles Search and List */}
                    <SubmissionContainer
                        submissions={submissions}
                        currentStatus={currentStatus}
                        role="editor"
                    />

                    {/* Footer Stats */}
                    <div className="p-8 border-t border-primary/5 flex items-center justify-center bg-primary/[0.01]">
                        <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-sm font-black text-primary/20 tracking-[0.4em] uppercase">
                            Secure Data Segment End | {submissions.length} Total Records in Queue
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
