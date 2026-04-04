import {
    FileStack, Users, Activity, AlertCircle, TrendingUp, ArrowRight, UserPlus, FileText, Clock, ExternalLink,
    CreditCard, ClipboardList, Download
} from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationDecisionButtons from './components/ApplicationDecisionButtons';
import InviteEditorModal from './components/InviteEditorModal';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    try {
        const session: any = await getServerSession(authOptions);
        const user = session?.user;
        
        // Use the new refactored author dashboard action for "My Works" tab
        const mySubmissions = await getMySubmissions();

        // 1. Unified Metrics Fetching (Parallel)
        const [
            subCountRes,
            userCountRes,
            paidRevenueRes,
            pendingRevenueRes,
            currentIssueRes,
            publishedCountRes,
            reviewStatsRes
        ] = await Promise.all([
            db.select({ value: count() }).from(submissions),
            db.select({ value: count() }).from(users),
            db.select({ total: sum(payments.amount) }).from(payments).where(or(eq(payments.status, 'paid'), eq(payments.status, 'verified'))),
            db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'pending')),
            db.select({ year: volumesIssues.year }).from(volumesIssues).where(eq(volumesIssues.status, 'open')).orderBy(desc(volumesIssues.year)).limit(1),
            db.select({ value: count() }).from(submissions).where(eq(submissions.status, 'published')),
            db.select({ 
                total: count(),
                completed: sql<number>`SUM(CASE WHEN ${reviews.submittedAt} IS NOT NULL THEN 1 ELSE 0 END)` 
            }).from(reviews)
        ]);

        const totalSubmissions = subCountRes[0].value;
        const totalUsers = userCountRes[0].value;
        const totalRevenue = Number(paidRevenueRes[0].total) || 0;
        const pendingRevenue = Number(pendingRevenueRes[0].total) || 0;
        const currentIssue = currentIssueRes[0]?.year ? `${currentIssueRes[0].year} Edition` : '2026 Edition';

        const stats = [
            { label: 'Revenue (Paid)', value: `₹${totalRevenue.toLocaleString()}`, icon: <TrendingUp className="w-4 h-4" />, variant: 'emerald' },
            { label: 'Active Staff', value: String(totalUsers), icon: <Users className="w-4 h-4" />, variant: 'blue' },
            { label: 'Submissions', value: String(totalSubmissions), icon: <FileStack className="w-4 h-4" />, variant: 'indigo' },
            { label: 'Pending APC', value: `₹${pendingRevenue.toLocaleString()}`, icon: <CreditCard className="w-4 h-4" />, variant: 'amber' },
        ];

        // 2. Recent Lists with Type Safety
        const recentSubmissions = await db.select({
            id: submissions.id,
            paper_id: submissions.paperId,
            status: submissions.status,
            submitted_at: submissions.submittedAt,
            title: submissionVersions.title,
            author_name: userProfiles.fullName
        })
        .from(submissions)
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            sql`${submissionVersions.versionNumber} = 1`
        ))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .orderBy(desc(submissions.submittedAt))
        .limit(5);

        const pendingApplications = await db.select()
            .from(applications)
            .where(eq(applications.status, 'pending'))
            .orderBy(desc(applications.createdAt))
            .limit(3);

        const allStaff = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
            created_at: users.createdAt,
            full_name: userProfiles.fullName
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .orderBy(desc(users.createdAt))
        .limit(10);

        // 3. Status Distribution
        const pubCount = publishedCountRes[0].value;
        const totalReviews = reviewStatsRes[0].total;
        const completedReviews = Number(reviewStatsRes[0].completed) || 0;

        const pubPercent = totalSubmissions > 0 ? (pubCount / totalSubmissions) * 100 : 0;
        const revPercent = totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0;

        // 4. Infrastructure Health
        const startDb = performance.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = (performance.now() - startDb).toFixed(2);

        const getDirSize = (dirPath: string): number => {
            let size = 0;
            try {
                const files = fs.readdirSync(dirPath);
                for (const file of files) {
                    const filePath = path.join(dirPath, file);
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        size += getDirSize(filePath);
                    } else {
                        size += stats.size;
                    }
                }
            } catch (e) { }
            return size;
        };

        const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
        const storageSizeBytes = getDirSize(uploadsPath);
        const storageMB = (storageSizeBytes / (1024 * 1024)).toFixed(1);
        const storageLimit = 500;
        const storagePercent = Math.min((Number(storageMB) / storageLimit) * 100, 100);

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memUsedPercent = (((totalMem - freeMem) / totalMem) * 100).toFixed(2);

        return (
            <section className="space-y-6">
                {/* Header Section */}
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-8 transition-all duration-500">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary/10 text-primary border-none text-[10px] sm:text-xs xl:text-[11px] 2xl:text-sm font-semibold tracking-widest px-3 py-1 2xl:px-4 2xl:py-1.5 capitalize rounded-full">System overview</Badge>
                            <div className="w-1.5 h-1.5 2xl:w-2 2xl:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-sm font-semibold text-muted-foreground uppercase tracking-widest opacity-60">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</span>
                        </div>
                        <h1 className=" font-semibold tracking-widest text-foreground uppercase leading-none text-2xl xl:text-2xl 2xl:text-3xl">Dashboard Protocol</h1>
                        <p className="text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-lg font-medium text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2">Authenticated as {user?.name || user?.fullName}. Monitoring active infrastructure.</p>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap gap-3">
                        <Button size="lg" asChild className="flex-1 sm:flex-none h-11 xl:h-12 2xl:h-14 px-6 xl:px-8 2xl:px-10 bg-primary text-white dark:text-slate-900 border-none rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer font-semibold text-xs xl:text-sm 2xl:text-base tracking-widest uppercase">
                            <Link href="/admin/users" className="flex items-center gap-2 2xl:gap-3 cursor-pointer">
                                <UserPlus className="w-4 h-4 2xl:w-5 2xl:h-5" /> Personnel Directory
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-8 transition-all duration-500">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-border/50 shadow-sm bg-card backdrop-blur-sm 2xl:rounded-3xl">
                            <CardContent className="p-6 2xl:p-10">
                                <div className="flex items-center justify-between mb-4 2xl:mb-6">
                                    <div className={`w-10 h-10 2xl:w-16 2xl:h-16 rounded-lg 2xl:rounded-2xl flex items-center justify-center ${stat.variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                                        stat.variant === 'blue' ? 'bg-blue-500/10 text-blue-600' :
                                            stat.variant === 'indigo' ? 'bg-indigo-500/10 text-indigo-600' :
                                                'bg-amber-500/10 text-amber-600'
                                        }`}>
                                        <div className="[&>svg]:w-4 [&>svg]:h-4 [&>svg]:2xl:w-8 [&>svg]:2xl:h-8">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="h-5 2xl:h-7 px-1.5 2xl:px-3 text-[9px] 2xl:text-xs font-semibold tracking-widest uppercase border-primary/20 text-primary">Live Data</Badge>
                                </div>
                                <div className="space-y-1 2xl:space-y-2">
                                    <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground capitalize tracking-widest opacity-60">{stat.label}</p>
                                    <h3 className=" font-semibold text-foreground tracking-wider text-2xl 2xl:text-3xl">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="overview" className="space-y-6 2xl:space-y-10">
                    <TabsList className="bg-muted/50 p-1 2xl:p-2 w-full flex flex-wrap sm:inline-flex justify-start sm:justify-center h-auto gap-1 2xl:gap-2 rounded-2xl border border-border/50">
                        <TabsTrigger value="overview" className="flex-1 sm:flex-none px-4 sm:px-6 2xl:px-8 py-3 2xl:py-4 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-base font-semibold capitalize tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all">Queue audit</TabsTrigger>
                        <TabsTrigger value="my-papers" className="flex-1 sm:flex-none px-4 sm:px-6 2xl:px-8 py-3 2xl:py-4 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-base font-semibold capitalize tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all">My works</TabsTrigger>
                        <TabsTrigger value="infrastructure" className="flex-1 sm:flex-none px-4 sm:px-6 2xl:px-8 py-3 2xl:py-4 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-base font-semibold capitalize tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all">Health diagnostics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                <Card className="border-border/50 shadow-sm bg-card transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                        <div className="space-y-1">
                                            <CardTitle className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-primary/60">
                                                Recent Submissions Activity
                                            </CardTitle>
                                        </div>
                                        <Button asChild variant="ghost" size="sm" className="h-8 group text-primary hover:bg-primary/20 cursor-pointer">
                                            <Link href="/admin/submissions" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer">
                                                Manage All <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                                <div className="divide-y divide-border/30">
                                            {recentSubmissions.map((sub: any) => (
                                                <Link
                                                    href={`/admin/submissions/${sub.id}`}
                                                    key={sub.paper_id}
                                                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0 2xl:gap-6">
                                                        <div className="w-12 h-10 2xl:w-16 2xl:h-14 rounded-lg bg-primary/5 flex flex-col items-center justify-center font-semibold text-[10px] 2xl:text-xs text-primary/40 border border-primary/5 shrink-0">
                                                            <span className="opacity-40">NODE</span>
                                                            <span className="text-primary font-semibold uppercase">{sub.paper_id.split('-').pop()}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className=" font-semibold text-foreground truncate group-hover:text-primary transition-colors tracking-wider uppercase 2xl:text-base">{sub.title || "Untitled"}</h4>
                                                            <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground uppercase tracking-widest opacity-60">Authored by {sub.author_name} • {new Date(sub.submitted_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={`border-none text-[10px] 2xl:text-sm font-semibold uppercase py-1 px-3 rounded-full ${
                                                        sub.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 
                                                        sub.status === 'retracted' ? 'bg-rose-600/10 text-rose-600' :
                                                        'bg-primary/10 text-primary'}`}>
                                                        {sub.status.replace('_', ' ')}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="p-4 border-border/50 bg-card">
                                        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest mb-4 opacity-60">Operations Metrics</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-[9px] font-semibold uppercase tracking-widest mb-1.5 opacity-50">
                                                    <span>Publication Rate</span>
                                                    <span>{pubPercent.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full w-(--pub-progress)" style={{ '--pub-progress': `${pubPercent}%` } as React.CSSProperties} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[9px] font-semibold uppercase tracking-widest mb-1.5 opacity-50">
                                                    <span>Review Rate</span>
                                                    <span>{revPercent.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full w-(--rev-progress)" style={{ '--rev-progress': `${revPercent}%` } as React.CSSProperties} />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="p-4 border-border/50 bg-card border-dashed flex flex-col items-center justify-center text-center">
                                        <TrendingUp className="w-8 h-8 text-primary/30 mb-2" />
                                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-primary">Expand Team</h4>
                                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3 leading-wider opacity-40">Scale infrastructure system.</p>
                                        <InviteEditorModal />
                                    </Card>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Card className="border-border/50 shadow-sm bg-card transition-colors">
                                    <CardHeader className="pb-3 border-b border-border/30">
                                        <CardTitle className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-widest flex items-center gap-2 opacity-60">
                                            <ClipboardList className="w-4 h-4 text-primary" /> Pending Applications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-border/20">
                                            {pendingApplications.length === 0 ? (
                                                <div className="p-8 text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-widest opacity-40">No pending requests</div>
                                            ) : pendingApplications.map((app: any) => (
                                                <div key={app.id} className="p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="text-[9px] font-semibold uppercase tracking-widest px-2 h-5 rounded-full border-primary/10 text-primary/60">{app.applicationType}</Badge>
                                                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest opacity-40">{new Date(app.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h5 className=" font-semibold text-foreground leading-wider tracking-wider uppercase">{app.fullName}</h5>
                                                    <ApplicationDecisionButtons id={app.id} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-muted/20 border-t border-border/20 text-center">
                                            <Button asChild variant="ghost" className="h-8 text-[10px] font-semibold uppercase tracking-widest text-primary hover:bg-primary/15 cursor-pointer">
                                                <Link className="cursor-pointer" href="/admin/applications">Audit Performance</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="my-papers" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mySubmissions.length === 0 ? (
                                <Card className="md:col-span-2 lg:col-span-3 border-dashed border-2 bg-muted/10 py-16 text-center">
                                    <div className="max-w-xs mx-auto space-y-4">
                                        <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto shadow-sm">
                                            <FileText className="w-6 h-6 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium px-4">Submit and track your own research manuscripts from the system portal.</p>
                                        <Button asChild size="sm" className="bg-primary text-white hover:bg-primary/90 rounded-lg cursor-pointer">
                                            <Link className="cursor-pointer" href="/submit">New Manuscript</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : mySubmissions.map((paper: any) => (
                                <Card key={paper.id} className="border-border/50 shadow-sm bg-card hover:border-primary/20 transition-all group overflow-hidden">
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-[9px] font-semibold tracking-widest uppercase border-none bg-muted px-2 py-0.5">ID: {paper.paper_id}</Badge>
                                            <Badge className={`text-[9px] font-semibold uppercase tracking-widest py-0.5 px-2 border-none rounded-full ${paper.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' :
                                                paper.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' :
                                                    'bg-indigo-500/10 text-indigo-600'
                                                }`}>
                                                {paper.status}
                                            </Badge>
                                        </div>
                                        <h3 className=" font-semibold text-foreground line-clamp-2 h-10 group-hover:text-primary transition-colors leading-wider tracking-wider uppercase">{paper.title}</h3>
                                        <div className="flex items-center justify-between pt-4 border-t border-border/10">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-semibold uppercase tracking-widest opacity-40"><Clock className="w-3 h-3" /> {new Date(paper.submitted_at).toLocaleDateString()}</span>
                                            <Button asChild variant="ghost" size="sm" className="h-7 px-3 text-primary hover:bg-primary/15 rounded-md text-[10px] font-semibold uppercase tracking-widest cursor-pointer">
                                                <Link href={`/track?id=${paper.paper_id}`} className="flex items-center gap-1.5 cursor-pointer">
                                                    Portal <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-muted/20 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${paper.status === 'published' ? 'bg-emerald-500' : 'bg-primary'} w-(--status-progress)`}
                                            style={{ '--status-progress': paper.status === 'published' ? '100%' : '15%' } as React.CSSProperties}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Infrastructure tab omitted for brevity but should be refactored similarly */}
                    <TabsContent value="infrastructure" className="space-y-4">
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 border-border/50 shadow-sm bg-card overflow-hidden">
                                <CardHeader className="p-4 border-b border-border/30 flex flex-row items-center justify-between bg-muted/10">
                                    <CardTitle className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-widest flex items-center gap-2 opacity-60">
                                        <Users className="w-4 h-4 text-primary" /> Active Personnel
                                    </CardTitle>
                                    <Button size="sm" asChild className="h-8 px-4 bg-primary text-white dark:text-slate-900 hover:opacity-90 dark:hover:text-slate-900 text-[10px] font-semibold uppercase tracking-widest rounded-lg cursor-pointer">
                                        <Link className="cursor-pointer" href="/admin/users">Manage All</Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/20">
                                        {allStaff.map((staff: any) => (
                                            <div key={staff.id} className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs uppercase border border-primary/10">
                                                        {staff.full_name?.charAt(0) || staff.email.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h5 className=" font-semibold text-foreground tracking-wider uppercase">{staff.full_name || 'System User'}</h5>
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest opacity-60 leading-none">{staff.email}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`h-6 text-[9px] font-semibold uppercase tracking-widest border-none px-3 rounded-full ${staff.role === 'admin' ? 'bg-rose-500/10 text-rose-600' : staff.role === 'editor' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                    {staff.role}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 shadow-sm bg-card transition-colors">
                                <CardHeader className="pb-3 border-b border-border/30">
                                    <CardTitle className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-widest opacity-60">Infrastructure Health</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {[
                                        { label: 'Latency', value: `${dbLatency}ms`, status: Number(dbLatency) < 5 ? 'Optimal' : 'Nominal', icon: Activity },
                                        { label: 'Storage', value: `${storageMB}MB / ${storageLimit}MB`, status: storagePercent < 80 ? 'Healthy' : 'Near Limit', icon: Download },
                                        { label: 'System Load', value: `${memUsedPercent}%`, status: Number(memUsedPercent) < 70 ? 'Optimal' : 'Elevated', icon: Users }
                                    ].map((metric) => (
                                        <div key={metric.label} className="p-4 rounded-xl bg-muted/20 border border-border/30 space-y-1.5 transition-all hover:bg-muted/30">
                                            <div className="flex justify-between items-center text-[9px] uppercase font-semibold tracking-widest text-muted-foreground opacity-60">
                                                <span className="flex items-center gap-1.5"><metric.icon className="w-3 h-3" /> {metric.label}</span>
                                                <span className={metric.status === 'Optimal' || metric.status === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}>{metric.status}</span>
                                            </div>
                                            <p className="text-xl font-semibold text-foreground tracking-wider">{metric.value}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </section>
        );
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        return <section className="p-12 text-center text-muted-foreground font-semibold text-[10px] uppercase tracking-widest min-h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/5 flex items-center justify-center text-destructive">
                <AlertCircle className="w-6 h-6" />
            </div>
            Critical System Logic Error. Contact technical support protocols.
        </section>;
    }
}
