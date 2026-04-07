import { TrendingUp, FileStack, ShieldCheck, CreditCard, BookOpen, Activity, HardDrive, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import * as schema from "@/db/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMySubmissions } from '@/actions/author-submissions';
import { Button } from "@/components/ui/button";
import { DashboardRegistry } from '@/features/dashboard/components/DashboardRegistry';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import * as ss from 'simple-statistics';

export const dynamic = 'force-dynamic';

export default async function EditorDashboard() {
    try {
        const session: any = await getServerSession(authOptions);
        const user = session?.user;
        const mySubmissions = await getMySubmissions();

        // 1. Data Fetching
        const [totalSubmissions] = await db.select({ value: count() }).from(schema.submissions);
        const [underReview] = await db.select({ value: count() }).from(schema.submissions).where(eq(schema.submissions.status, 'under_review'));
        const [pendingPayments] = await db.select({ value: count() }).from(schema.payments).where(eq(schema.payments.status, 'pending'));
        const [publishedCount] = await db.select({ value: count() }).from(schema.submissions).where(eq(schema.submissions.status, 'published'));
        
        const latestIssue = await db.query.volumesIssues.findFirst({
            where: eq(schema.volumesIssues.status, 'published'),
            orderBy: [desc(schema.volumesIssues.year), desc(schema.volumesIssues.volumeNumber)]
        });
        const currentIssue = latestIssue ? `${latestIssue.year} Edition` : '2026 Edition';

        const stats = [
            { label: 'Submissions', value: totalSubmissions.value, icon: 'FileStack', variant: 'indigo' },
            { label: 'Reviewing', value: underReview.value, icon: 'ShieldCheck', variant: 'blue' },
            { label: 'Pending', value: pendingPayments.value, icon: 'CreditCard', variant: 'emerald' },
            { label: 'Published', value: currentIssue, icon: 'BookOpen', variant: 'amber' },
        ];

        const recentSubmissions = await db.select({
            id: schema.submissions.id,
            paper_id: schema.submissions.paperId,
            status: schema.submissions.status,
            title: schema.submissionVersions.title,
            author_name: schema.userProfiles.fullName,
            submitted_at: schema.submissions.submittedAt
        })
        .from(schema.submissions)
        .leftJoin(schema.submissionVersions, and(
            eq(schema.submissions.id, schema.submissionVersions.submissionId),
            sql`${schema.submissionVersions.versionNumber} = 1`
        ))
        .leftJoin(schema.userProfiles, eq(schema.submissions.correspondingAuthorId, schema.userProfiles.userId))
        .orderBy(desc(schema.submissions.submittedAt))
        .limit(5);

        // 2. Health Calculations
        const startDb = performance.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = (performance.now() - startDb).toFixed(2);
        
        const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
        const getDirSize = (p: string): number => {
            let s = 0; try { fs.readdirSync(p).forEach(f => { const fp = path.join(p, f); const st = fs.statSync(fp); s += st.isDirectory() ? getDirSize(fp) : st.size; }); } catch(e){} return s;
        };
        const storageMB = (getDirSize(uploadsPath) / (1024 * 1024)).toFixed(1);
        const memUsed = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
        const uptimeHours = (os.uptime() / 3600).toFixed(1);
        const healthScore = ss.mean([100 - memUsed, 100 - (Number(dbLatency) / 2), 100 - (Number(storageMB) / 5)]).toFixed(1);

        const healthMetrics = [
            { label: 'Database', value: `${dbLatency}ms`, icon: 'Activity', status: Number(dbLatency) < 100 ? 'Optimal' : 'Checking' },
            { label: 'Storage', value: `${storageMB} MB`, icon: 'HardDrive', status: 'Healthy' },
            { label: 'Uptime', value: `${uptimeHours}h`, icon: 'Shield', status: 'Excellent' },
            { label: 'Load', value: `${memUsed.toFixed(1)}%`, status: memUsed < 80 ? 'Optimal' : 'High', icon: 'Users' },
            { label: 'Health', value: `${healthScore}%`, status: Number(healthScore) > 90 ? 'Excellent' : 'Good', icon: 'Shield' }
        ];

        const pubPercent = totalSubmissions.value > 0 ? (publishedCount.value / totalSubmissions.value) * 100 : 0;
        // Simplified review rate for editor
        const revPercent = 85.0; 

        return (
            <DashboardRegistry 
                role="editor"
                user={user}
                stats={stats}
                recentSubmissions={recentSubmissions}
                mySubmissions={mySubmissions}
                healthMetrics={healthMetrics}
                percentages={{ pub: pubPercent, rev: revPercent }}
                queueTabLabel="Submissions"
                recentSubmissionsTitle="Active Submissions"
                metricsLabels={{ pubRate: "Publication Rate", revRate: "Review Rate" }}
            >
                <div className="p-6 border-primary/10 bg-card/30 border-dashed border-2 flex flex-col items-center justify-center text-center rounded-xl">
                    <TrendingUp className="w-8 h-8 text-primary/20 mb-3" />
                    <h4 className="mb-1">Support</h4>
                    <p className="opacity-60 mb-4">Need help with your submissions?</p>
                    <Button asChild size="sm" variant="outline" className="h-9 px-6 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/5 rounded-lg cursor-pointer">
                        <Link href="/editor/messages" className="cursor-pointer">Contact</Link>
                    </Button>
                </div>
            </DashboardRegistry>
        );
    } catch (error) {
        console.error("Editor Dashboard Error:", error);
        return <div>Logical Sync Failure in Sector 0.</div>;
    }
}
