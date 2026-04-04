import {
    FileStack, ShieldCheck, AlertCircle, ArrowRight, BookOpen,
    CheckCircle, FileText, Clock, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
    submissions,
    submissionVersions,
    userProfiles,
    reviewAssignments
} from '@/db/schema';
import { eq, desc, and, count, ne } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMySubmissions } from '@/actions/author-submissions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = 'force-dynamic';

export default async function ReviewerDashboard() {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user?.id) redirect('/login');
        const user = session.user;

        const mySubmissions = await getMySubmissions();

        // 1. Data Fetching - Metrics via Drizzle
        const [pendingCountRes] = await db.select({ value: count() })
            .from(reviewAssignments)
            .where(and(
                eq(reviewAssignments.reviewerId, user.id),
                ne(reviewAssignments.status, 'completed')
            ));
        
        const [completedCountRes] = await db.select({ value: count() })
            .from(reviewAssignments)
            .where(and(
                eq(reviewAssignments.reviewerId, user.id),
                eq(reviewAssignments.status, 'completed')
            ));

        const pendingCount = pendingCountRes.value;
        const completedCount = completedCountRes.value;

        const stats = [
            { label: 'Pending Reviews', value: String(pendingCount), icon: <ShieldCheck className="w-5 h-5 text-blue-500" />, variant: 'blue' },
            { label: 'Completed', value: String(completedCount), icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, variant: 'emerald' },
            { label: 'Total Assignments', value: String(Number(pendingCount) + Number(completedCount)), icon: <FileStack className="w-5 h-5 text-indigo-500" />, variant: 'primary' },
        ];

        // 2. Data Fetching - Detailed Assignments with Joins
        const assignedRows = await db.select({
            id: reviewAssignments.id,
            paperId: submissions.paperId,
            title: submissionVersions.title,
            authorName: userProfiles.fullName,
            status: reviewAssignments.status,
            assignedAt: reviewAssignments.assignedAt
        })
        .from(reviewAssignments)
        .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
        .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
        .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
        .where(eq(reviewAssignments.reviewerId, user.id))
        .orderBy(desc(reviewAssignments.assignedAt))
        .limit(5);

        return (
            <section className="space-y-6 pb-20">
                {/* Header Section */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                    <div className="space-y-2">
                        <h1 className=" font-black text-foreground tracking-widest uppercase leading-none text-2xl xl:text-3xl 2xl:text-3xl">
                            Reviewer Portal
                        </h1>
                        <p className="text-xs sm:text-sm 2xl:text-lg font-medium text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2 transition-all duration-500">
                            Technical evaluation and quality oversight for {user?.fullName}.
                        </p>
                    </div>
                </header>

                {/* Role Banner */}
                <Card className="bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 transition-all duration-500">
                    <CardContent className="p-6 sm:p-8 2xl:p-10">
                        <div className="flex flex-col md:flex-row items-center gap-6 2xl:gap-8">
                            <div className="w-16 h-16 2xl:w-20 2xl:h-20 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <BookOpen className="w-8 h-8 2xl:w-10 2xl:h-10 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <Badge variant="outline" className="text-[10px] 2xl:text-sm font-bold tracking-widest uppercase border-emerald-200 dark:border-emerald-500/20 text-emerald-600 px-3 py-1 2xl:px-4 2xl:py-1.5">Peer Reviewer Protocol</Badge>
                                <h2 className=" font-black text-foreground tracking-wider uppercase text-lg xl:text-xl 2xl:text-2xl">Active Mission: Ensure Scientific Integrity</h2>
                                <p className="text-sm 2xl:text-base text-muted-foreground max-w-2xl 2xl:max-w-3xl font-medium opacity-80 leading-relaxed transition-all duration-500">
                                    Your expert evaluation maintains the rigorous standards of our scientific community. Every review is a contribution to global knowledge.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm group hover:border-primary/20 transition-all">
                            <CardContent className="p-6 2xl:p-8 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/60 tracking-widest uppercase">{stat.label}</p>
                                    <h3 className=" font-black text-foreground 2xl:text-2xl">{stat.value}</h3>
                                </div>
                                <div className="w-12 h-12 2xl:w-16 2xl:h-16 rounded-xl bg-muted/50 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <div className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:2xl:w-8 [&>svg]:2xl:h-8">
                                        {stat.icon}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="assignments" className="space-y-4">
                    <TabsList className="bg-muted/50 p-1 2xl:p-1.5 rounded-xl w-full flex flex-wrap sm:inline-flex h-auto gap-1 2xl:gap-2">
                        <TabsTrigger value="assignments" className="flex-1 sm:flex-none rounded-lg px-4 py-2 sm:px-8 2xl:px-10 2xl:py-3 text-[10px] sm:text-xs 2xl:text-base font-bold uppercase tracking-widest transition-all whitespace-nowrap">Assigned Works</TabsTrigger>
                        <TabsTrigger value="my-papers" className="flex-1 sm:flex-none rounded-lg px-4 py-2 sm:px-8 2xl:px-10 2xl:py-3 text-[10px] sm:text-xs 2xl:text-base font-bold uppercase tracking-widest transition-all whitespace-nowrap">Personal Research</TabsTrigger>
                    </TabsList>

                    <TabsContent value="assignments" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 border-border/50 shadow-sm bg-background/50">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">Technical Queue</CardTitle>
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="h-8 px-4 text-xs font-bold uppercase text-primary hover:bg-secondary rounded-lg transition-all cursor-pointer">
                                        <Link href="/reviewer/reviews" className="flex items-center gap-2 cursor-pointer">
                                            View Archive <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                     <div className="divide-y divide-border/30">
                                        {assignedRows.map((sub: any) => (
                                            <Link
                                                href="/reviewer/reviews"
                                                key={sub.paperId}
                                                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-all group"
                                            >
                                                <div className="flex items-center gap-4 min-w-0 2xl:gap-6">
                                                    <div className="w-12 h-10 2xl:w-16 2xl:h-14 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-[10px] 2xl:text-xs text-muted-foreground border border-border shrink-0 group-hover:bg-background transition-colors">
                                                        {sub.paperId.split('-').pop()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className=" font-semibold text-foreground truncate group-hover:text-primary transition-colors 2xl:text-base">{sub.title || "Untitled"}</h4>
                                                        <p className="text-[10px] 2xl:text-sm text-muted-foreground font-medium uppercase opacity-70">
                                                            By {sub.authorName} • {new Date(sub.assignedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={`border-none text-[10px] 2xl:text-xs font-bold uppercase py-0.5 px-2 2xl:px-3 bg-primary/10 text-primary`}>
                                                    {sub.status.replace('_', ' ')}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>

                                </CardContent>
                            </Card>

                            <Card className="border-border shadow-sm bg-background/50 flex flex-col p-6 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-[9px] sm:text-[10px] xl:text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Operational Protocol</h4>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-80">Please ensure all evaluations follow the double-blind review system guidelines.</p>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Methodology Audit', icon: AlertCircle },
                                        { label: 'Ethical Verification', icon: ShieldCheck },
                                        { label: 'Source Validation', icon: BookOpen }
                                    ].map((action, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                                            <action.icon className="w-4 h-4 text-primary/50" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">{action.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button asChild variant="outline" className="mt-auto h-11 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer">
                                    <Link className="cursor-pointer" href="/reviewer/reviews">Access Management Hub</Link>
                                </Button>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="my-papers" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mySubmissions.length === 0 ? (
                                <Card className="md:col-span-2 lg:col-span-3 border-dashed border-2 border-border/50 bg-muted/10 py-16 text-center rounded-xl">
                                    <div className="flex flex-col items-center gap-3 max-w-xs mx-auto text-muted-foreground">
                                        <FileText className="w-10 h-10 opacity-20" />
                                        <span className="font-bold uppercase tracking-widest text-xs">No Personal Records</span>
                                        <Button asChild size="sm" className="mt-2 bg-primary text-white hover:bg-primary/90 font-bold uppercase text-[10px] rounded-lg shadow-sm cursor-pointer">
                                            <Link className="cursor-pointer" href="/submit">Start Submission</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : mySubmissions.map((paper: any) => (
                                <Card key={paper.id} className="border-border/50 shadow-sm bg-background hover:shadow-md transition-all group overflow-hidden rounded-xl">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-[9px] border-none bg-muted px-2 py-0.5">ID: {paper.paper_id}</Badge>
                                            <Badge className={`text-[9px] font-bold uppercase py-0.5 px-2 border-none ${paper.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' :
                                                paper.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' :
                                                    'bg-primary/10 text-primary'
                                                }`}>
                                                {paper.status}
                                            </Badge>
                                        </div>
                                        <h3 className=" font-semibold text-foreground line-clamp-2 h-10 group-hover:text-primary transition-colors leading-wider">{paper.title}</h3>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-4 border-t border-border/10">
                                            <span className="flex items-center gap-1.5 font-medium uppercase"><Clock className="w-3 h-3 opacity-50" /> {new Date(paper.submitted_at).toLocaleDateString()}</span>
                                            <Button asChild variant="ghost" size="sm" className="h-7 px-3 text-primary hover:bg-primary/15 rounded-md font-bold uppercase text-[9px] cursor-pointer">
                                                <Link href={`/track?id=${paper.paper_id}`} className="flex items-center gap-1.5 cursor-pointer">
                                                    Trace <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>
        );
    } catch (error) {
        console.error("Reviewer Dashboard Error:", error);
        return <div className="p-24 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs min-h-[500px] flex items-center justify-center border-border bg-muted/10 rounded-xl">
            Unauthorized Access or System Logical Fault.
        </div>;
    }
}
