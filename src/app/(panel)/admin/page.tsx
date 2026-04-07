import { FileStack, Users, Activity, TrendingUp, UserPlus, CreditCard, Shield, Download, HardDrive } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
    submissions,
    users,
    userProfiles,
    payments,
    volumesIssues,
    applications,
    submissionVersions,
    reviews
} from '@/db/schema';
import { eq, sql, desc, and, count, sum, or } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMySubmissions } from '@/actions/author-submissions';
import { Button } from "@/components/ui/button";
import { DashboardRegistry } from '@/features/dashboard/components/DashboardRegistry';
import InviteEditorModal from './components/InviteEditorModal';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import * as ss from 'simple-statistics';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    try {
        const session: any = await getServerSession(authOptions);
        const user = session?.user;
        const mySubmissions = await getMySubmissions();

        // 1. Data Fetching
        const [
            subCountRes,
            userCountRes,
            paidRevenueRes,
            pendingRevenueRes,
            publishedCountRes,
            reviewStatsRes
        ] = await Promise.all([
            db.select({ value: count() }).from(submissions),
            db.select({ value: count() }).from(users),
            db.select({ total: sum(payments.amount) }).from(payments).where(or(eq(payments.status, 'paid'), eq(payments.status, 'verified'))),
            db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'pending')),
            db.select({ value: count() }).from(submissions).where(eq(submissions.status, 'published')),
            db.select({ 
                total: count(),
                completed: sql<number>`SUM(CASE WHEN ${reviews.submittedAt} IS NOT NULL THEN 1 ELSE 0 END)` 
            }).from(reviews)
        ]);

        const stats = [
            { label: 'Revenue', value: Number(paidRevenueRes[0].total) || 0, icon: 'TrendingUp', variant: 'emerald', prefix: '₹' },
            { label: 'Users', value: userCountRes[0].value, icon: 'Users', variant: 'blue' },
            { label: 'Submissions', value: subCountRes[0].value, icon: 'FileStack', variant: 'indigo' },
            { label: 'Pending', value: Number(pendingRevenueRes[0].total) || 0, icon: 'CreditCard', variant: 'amber', prefix: '₹' },
        ];

        const recentSubmissions = await db.select({
            id: submissions.id,
            paper_id: submissions.paperId,
            status: submissions.status,
            submitted_at: submissions.submittedAt,
            title: submissionVersions.title,
            author_name: userProfiles.fullName
        })
        .from(submissions)
        .leftJoin(submissionVersions, and(eq(submissions.id, submissionVersions.submissionId), sql`${submissionVersions.versionNumber} = 1`))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .orderBy(desc(submissions.submittedAt))
        .limit(5);

        const pendingApps = await db.select().from(applications).where(eq(applications.status, 'pending')).orderBy(desc(applications.createdAt)).limit(3);
        
        const allStaff = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
            full_name: userProfiles.fullName
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .orderBy(desc(users.createdAt))
        .limit(10);

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
        ];

        const pubPercent = subCountRes[0].value > 0 ? (publishedCountRes[0].value / subCountRes[0].value) * 100 : 0;
        const revPercent = reviewStatsRes[0].total > 0 ? (Number(reviewStatsRes[0].completed) / reviewStatsRes[0].total) * 100 : 0;

        return (
            <DashboardRegistry 
                role="admin"
                user={user}
                stats={stats}
                recentSubmissions={recentSubmissions}
                mySubmissions={mySubmissions}
                healthMetrics={healthMetrics}
                pendingApplications={pendingApps}
                allStaff={allStaff}
                percentages={{ pub: pubPercent, rev: revPercent }}
                extraActions={
                    <Button size="lg" asChild className="h-12 px-8 bg-primary text-white font-semibold rounded-xl shadow-lg hover:bg-primary/90 transition-all cursor-pointer">
                        <Link href="/admin/users" className="flex items-center gap-2 cursor-pointer">
                            <UserPlus className="w-4 h-4" /> Users
                        </Link>
                    </Button>
                }
            >
                <div className="p-6 border-primary/10 bg-card/30 border-dashed border-2 flex flex-col items-center justify-center text-center rounded-xl">
                    <TrendingUp className="w-8 h-8 text-primary/20 mb-3" />
                    <h4 className="mb-1">Add Editor</h4>
                    <p className="opacity-60 mb-4">Invite a new editor to the team.</p>
                    <InviteEditorModal />
                </div>
            </DashboardRegistry>
        );
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        return <div>Critical System Logic Latency.</div>;
    }
}
