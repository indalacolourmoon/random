import {
    FileStack,
    Users,
    Activity,
    BookOpen,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    Search,
    UserPlus,
    ShieldCheck,
    FileText,
    Clock,
    CheckCircle,
    ExternalLink,
    CreditCard,
    ClipboardList,
    Download
} from 'lucide-react';
import Link from 'next/link';
import pool from '@/lib/db';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMySubmissions } from '@/actions/my-submissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = 'force-dynamic';

export default async function EditorDashboard() {
    try {
        const session: any = await getServerSession(authOptions);
        const user = session?.user;
        const mySubmissions = await getMySubmissions();

        // 1. Data Fetching - Metrics & Stats
        const [submissionRows]: any = await pool.execute('SELECT COUNT(*) as count FROM submissions');
        const [reviewRows]: any = await pool.execute("SELECT COUNT(*) as count FROM submissions WHERE status = 'under_review'");
        const [paymentRows]: any = await pool.execute("SELECT COUNT(*) as count FROM payments WHERE status = 'unpaid'");

        const totalSubmissions = submissionRows[0].count;
        const underReview = reviewRows[0].count;
        const pendingPayments = paymentRows[0].count;

        const [issueRows]: any = await pool.execute(
            "SELECT year FROM volumes_issues WHERE status = 'open' ORDER BY year DESC LIMIT 1"
        );
        const currentIssue = issueRows.length > 0
            ? `${issueRows[0].year} Edition`
            : '2026 Edition';

        const stats = [
            { label: 'Manuscript Queue', value: String(totalSubmissions), icon: <FileStack className="w-4 h-4" />, variant: 'primary' },
            { label: 'Under Review', value: String(underReview), icon: <ShieldCheck className="w-4 h-4" />, variant: 'blue' },
            { label: 'Pending APC', value: String(pendingPayments), icon: <CreditCard className="w-4 h-4" />, variant: 'emerald' },
            { label: 'Open Issue', value: currentIssue, icon: <BookOpen className="w-4 h-4" />, variant: 'amber' },
        ];

        // 2. Data Fetching - Lists
        const [recentSubmissions]: any = await pool.execute(
            'SELECT id, paper_id, title, author_name, status, submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 5'
        );

        // 3. Status Distribution
        const [publishedRows]: any = await pool.execute("SELECT COUNT(*) as count FROM submissions WHERE status = 'published'");
        const [reviewStats]: any = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM reviews
        `);

        const pubCount = publishedRows[0].count;
        const totalReviews = reviewStats[0].total || 0;
        const completedReviews = reviewStats[0].completed || 0;

        const pubPercent = totalSubmissions > 0 ? (pubCount / totalSubmissions) * 100 : 0;
        const revPercent = totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0;

        // 4. Infrastructure/Health (Adapted for Editor)
        const startDb = performance.now();
        await pool.execute('SELECT 1');
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

        return (
            <main className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 py-8 border-b border-primary/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-widest px-3 py-1 uppercase">Editorial Hub</Badge>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</span>
                        </div>
                        <h1 className=" font-black text-foreground tracking-widest uppercase leading-none">Dashboard</h1>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground border-l-2 border-primary/10 pl-4 transition-all duration-500">Managing journal lifecycle and content quality for {user?.fullName}.</p>
                    </div>
                </header>

                {/* Role Overview Banner (Restyled) */}
                <Card className="bg-primary/5 border-primary/10 overflow-hidden relative group rounded-xl shadow-inner mb-6">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-110 rotate-12">
                        <ShieldCheck className="w-32 h-32 text-primary" />
                    </div>
                    <CardContent className="p-8 sm:p-10">
                        <div className="max-w-4xl 2xl:max-w-6xl space-y-4 2xl:space-y-6">
                            <Badge className="bg-primary text-white text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-[0.2em] px-3 py-1 2xl:px-4 2xl:py-2 border-none shadow-sm rounded-lg uppercase">Editorial Control</Badge>
                            <h2 className=" font-black text-foreground tracking-wider transition-all duration-500">Focus: Pipeline Throughput & Integrity</h2>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {['Desk Screening', 'Expert Selection', 'Final Determinations'].map((action, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-card/80 border border-primary/10 px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-bold text-primary/70 uppercase tracking-widest shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                                        {action}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6 transition-all duration-500">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-border/40 shadow-sm bg-card transition-all hover:border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.variant === 'primary' ? 'bg-primary/10 text-primary' :
                                        stat.variant === 'blue' ? 'bg-blue-500/10 text-blue-600' :
                                            stat.variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                                                'bg-amber-500/10 text-amber-600'
                                        }`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="space-y-1 2xl:space-y-2">
                                    <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <h3 className=" font-black text-foreground transition-all duration-500">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="queue" className="space-y-4">
                    <TabsList className="bg-muted/50 p-1 w-full flex flex-wrap sm:inline-flex justify-start sm:justify-center h-auto gap-1 2xl:gap-2">
                        <TabsTrigger value="queue" className="flex-1 sm:flex-none px-4 sm:px-8 2xl:px-12 py-2 2xl:py-3 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black uppercase tracking-widest whitespace-nowrap">Editorial Queue</TabsTrigger>
                        <TabsTrigger value="my-papers" className="flex-1 sm:flex-none px-4 sm:px-8 2xl:px-12 py-2 2xl:py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">My Papers</TabsTrigger>
                        <TabsTrigger value="health" className="flex-1 sm:flex-none px-4 sm:px-8 2xl:px-12 py-2 2xl:py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Sector Status</TabsTrigger>
                    </TabsList>

                    <TabsContent value="queue" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                <Card className="border-border/40 shadow-sm bg-card">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
                                        <div className="space-y-1">
                                            <CardTitle className="text-sm sm:text-base lg:text-base xl:text-lg 2xl:text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                                                Active Assignments
                                            </CardTitle>
                                        </div>
                                        <Button asChild variant="ghost" size="sm" className="h-8 group text-primary hover:bg-primary/5 cursor-pointer">
                                            <Link href="/editor/submissions" className="flex items-center gap-2 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-bold uppercase tracking-wider cursor-pointer">
                                                Manage Pipeline <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-border/30">
                                            {recentSubmissions.map((sub: any) => (
                                                <Link
                                                    href={`/editor/submissions/${sub.id}`}
                                                    key={sub.paper_id}
                                                    className="flex items-center justify-between p-5 hover:bg-muted/30 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-12 h-10 rounded bg-muted flex flex-col items-center justify-center font-mono text-[10px] text-muted-foreground border border-border shrink-0">
                                                            <span>ID</span>
                                                            <span className="font-bold text-foreground">{sub.paper_id.split('-').pop()}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className=" font-semibold text-foreground truncate group-hover:text-primary transition-colors">{sub.title}</h4>
                                                            <p className="text-[10px] 2xl:text-xs text-muted-foreground uppercase font-medium">By {sub.author_name} • {new Date(sub.submitted_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={`border-none text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-bold uppercase py-0.5 px-2 ${sub.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                                        {sub.status.replace('_', ' ')}
                                                    </Badge>
                                                </Link>
                                            ))}
                                            {recentSubmissions.length === 0 && (
                                                <div className="p-12 text-center text-xs text-muted-foreground italic font-medium">No active records in this segment</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="p-6 border-border/40 bg-card">
                                        <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-4">Quality Metrics</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                                                    <span>Success Ratio</span>
                                                    <span>{pubPercent.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pubPercent}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                                                    <span>Review Saturation</span>
                                                    <span>{revPercent.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${revPercent}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="p-6 border-border/40 bg-card border-dashed flex flex-col items-center justify-center text-center">
                                        <TrendingUp className="w-8 h-8 text-primary/30 mb-2" />
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Expand Network</h4>
                                        <p className="text-[10px] text-muted-foreground mb-4 leading-wider">Need more experts for your specific research track?</p>
                                        <Button asChild size="sm" variant="outline" className="h-8 text-[9px] font-bold uppercase tracking-widest text-primary border-primary/20 hover:bg-primary/5 rounded-lg cursor-pointer">
                                            <Link href="/editor/messages" className="cursor-pointer">Contact Desk</Link>
                                        </Button>
                                    </Card>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Card className="border-border/40 shadow-sm bg-card h-full">
                                    <CardHeader className="p-6 border-b border-border/30">
                                        <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4 text-primary" /> Task Matrix
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 mt-4">
                                        <div className="space-y-4">
                                            {[
                                                { icon: FileStack, label: 'Manuscript Screening' },
                                                { icon: ShieldCheck, label: 'Peer Review Oversight' },
                                                { icon: AlertCircle, label: 'Workflow Deadlines' }
                                            ].map((task, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors cursor-default">
                                                    <task.icon className="w-5 h-5 text-primary/40 shrink-0" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{task.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-8 pt-8 border-t border-border/30 text-center">
                                            <p className="text-[10px] text-muted-foreground/60 font-medium italic mb-4 px-4 leading-relaxed">System monitoring protocol active. Maintain integrity of the review cycle.</p>
                                            <Button asChild size="sm" className="w-full h-12 bg-primary text-white dark:text-black font-bold text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer">
                                                <Link href="/editor/submissions" className="flex items-center gap-2 cursor-pointer">
                                                    Audit Queue <ArrowRight className="w-3 h-3" />
                                                </Link>
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
                                <Card className="md:col-span-2 lg:col-span-3 border-dashed border-2 bg-muted/10 py-16 text-center rounded-xl">
                                    <div className="max-w-xs mx-auto space-y-4">
                                        <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto shadow-sm">
                                            <FileText className="w-6 h-6 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium px-4">Submit and track your own research manuscripts from the system portal.</p>
                                        <Button asChild size="sm" className="bg-primary text-white dark:text-black hover:bg-primary/90 rounded-lg dark:bg-primary/5 dark:text-primary dark:border-2 cursor-pointer">
                                            <Link className="cursor-pointer" href="/submit">New Manuscript</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                mySubmissions.map((paper: any) => (
                                    <Card key={paper.id} className="border-border/40 shadow-sm bg-card hover:border-primary/20 transition-all group overflow-hidden rounded-xl">
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-[9px] border-none bg-muted px-2 py-0.5">ID: {paper.paper_id}</Badge>
                                                <Badge className={`text-[9px] font-bold uppercase py-0.5 px-2 border-none ${paper.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    paper.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' :
                                                        'bg-indigo-500/10 text-indigo-600'
                                                    }`}>
                                                    {paper.status}
                                                </Badge>
                                            </div>
                                            <h3 className=" font-semibold text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors leading-wider">{paper.title}</h3>
                                            <div className="flex items-center justify-between pt-4 border-t border-border/10">
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium tracking-wider"><Clock className="w-3 h-3" /> {new Date(paper.submitted_at).toLocaleDateString()}</span>
                                                <Button asChild variant="ghost" size="sm" className="h-7 px-3 text-primary hover:bg-primary/5 rounded-md text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-bold uppercase cursor-pointer">
                                                    <Link href={`/track?id=${paper.paper_id}`} className="flex items-center gap-1.5 cursor-pointer">
                                                        Portal <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="h-1 bg-muted/20">
                                            <div
                                                className={`h-full transition-all duration-1000 ${paper.status === 'published' ? 'bg-emerald-500' : 'bg-primary'}`}
                                                style={{ width: paper.status === 'published' ? '100%' : '15%' }}
                                            />
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="health" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-border/40 shadow-sm bg-card transition-colors rounded-xl">
                                <CardHeader className="p-6 border-b border-border/30">
                                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" /> Sector Integrity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {[
                                        { label: 'Database Latency', value: `${dbLatency}ms`, status: Number(dbLatency) < 10 ? 'Optimal' : 'Nominal', icon: Box },
                                        { label: 'Asset Storage', value: `${storageMB}MB used`, status: storagePercent < 80 ? 'Healthy' : 'Near Limit', icon: HardDrive }
                                    ].map((metric, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/30 space-y-1">
                                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground">
                                                <span className="flex items-center gap-1.5"> {metric.label}</span>
                                                <span className={metric.status === 'Optimal' || metric.status === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}>{metric.status}</span>
                                            </div>
                                            <p className="text-xl font-bold text-foreground">{metric.value}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="border-border/40 shadow-sm bg-card transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none mb-4 uppercase tracking-[0.2em] text-[9px] px-3 py-1 font-black">All Systems Nominal</Badge>
                                <h4 className=" font-bold text-foreground mb-2 mt-2">Resource Utilization</h4>
                                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-medium">Monitoring data segment throughput and storage nodes. All editorial assets are secured and accessible.</p>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        );
    } catch (error: any) {
        console.error("Editor Dashboard Error:", error);
        return <div className="p-12 text-center text-muted-foreground font-semibold text-xs min-h-[400px] flex items-center justify-center">
            System Logic Latency. Refresh Page.
        </div>;
    }
}

// Minimal missing icons
const Box = ({ className }: { className?: string }) => <Activity className={className} />;
const HardDrive = ({ className }: { className?: string }) => <Download className={className} />;
