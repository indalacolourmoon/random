/**
 * Author Dashboard - Modernized for IJITEST
 */
import {
    FileStack, Clock, CheckCircle, BookOpen, ArrowRight,
    AlertCircle, Upload, ExternalLink, CreditCard, Timer,
    FileText, TrendingUp, Sparkles, LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAuthorDashboard } from '@/actions/author-submissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubmissionProgress } from '@/features/author/components/SubmissionProgress';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    submitted: { label: 'Under Editorial Review', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    editor_assigned: { label: 'Editor Assigned', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    under_review: { label: 'Peer Review In Progress', color: 'text-amber-600', bg: 'bg-amber-500/10' },
    revision_requested: { label: 'Revision Required', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    accepted: { label: 'Accepted', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Not Accepted', color: 'text-rose-600', bg: 'bg-rose-500/10' },
    payment_pending: { label: 'Payment Required', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    published: { label: 'Published', color: 'text-emerald-700', bg: 'bg-emerald-500/15' },
};

function getDaysRemaining(updatedAt: string): number {
    const d = 15 - Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, d);
}

export default async function AuthorDashboard() {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user) redirect('/login');
        if (session.user.role !== 'author') redirect(`/${session.user.role}`);

        const response = await getAuthorDashboard();
        const submissions = response.data?.submissions || [];

        const stats = [
            { label: 'Total Submitted', value: submissions.length, icon: <FileStack className="w-5 h-5 text-primary" /> },
            { label: 'Under Review', value: submissions.filter((s: any) => ['submitted', 'editor_assigned', 'under_review'].includes(s.status)).length, icon: <Clock className="w-5 h-5 text-amber-500" /> },
            { label: 'Accepted', value: submissions.filter((s: any) => ['accepted', 'payment_pending', 'published'].includes(s.status)).length, icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
            { label: 'Published', value: submissions.filter((s: any) => s.status === 'published').length, icon: <BookOpen className="w-5 h-5 text-blue-500" /> },
        ];

        return (
            <section className="space-y-12 pb-20 max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8 outline-none">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 group">
                             <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:rotate-12 transition-transform duration-500">
                                <LayoutDashboard className="w-5 h-5" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Center of Operations</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none">
                           Welcome back, <span className="bg-linear-to-r from-primary to-primary/40 bg-clip-text text-transparent">{session.user.name?.split(' ')[0] || 'Scholar'}</span>.
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground max-w-2xl leading-relaxed border-l-2 border-primary/20 pl-6">
                            IJITEST Author Portal provides end-to-end visibility into your research lifecycle — from initial submission through peer review and final branding.
                        </p>
                    </div>
                    <Button asChild className="h-14 px-8 bg-primary hover:bg-primary/90 text-white dark:text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl shadow-primary/20 group">
                        <Link href="/submit" className="flex items-center gap-3">
                            <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Submit New Research
                        </Link>
                    </Button>
                </header>

                {/* Performance Snapshot */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <Card key={stat.label} className="group relative border-border/40 bg-background/40 backdrop-blur-xl overflow-hidden hover:border-primary/30 transition-all duration-500 rounded-3xl">
                            <CardContent className="p-8">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
                                <div className="space-y-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mb-1">{stat.label}</p>
                                        <p className="text-4xl font-black text-foreground tabular-nums tracking-tighter">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Submissions Management */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                           Active Manuscripts <div className="h-px w-20 bg-primary/20" />
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                           Auto-sync: Active <Clock className="w-3 h-3" />
                        </div>
                    </div>

                    {submissions.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/50 bg-muted/5 py-32 text-center rounded-[3rem] overflow-hidden group">
                            <CardContent className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:scale-200 transition-transform duration-1000" />
                                    <FileText className="w-16 h-16 text-primary/20 relative z-10" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h3 className="font-black uppercase tracking-widest text-sm">Quiet for now...</h3>
                                    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                        Your scholarly journey at IJITEST starts with your first submission. We're ready when you are.
                                    </p>
                                </div>
                                <Button asChild size="lg" className="mt-4 bg-foreground text-background hover:bg-foreground/90 font-black uppercase text-[10px] tracking-widest rounded-xl px-10">
                                    <Link href="/submit">Initialize Submission</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {submissions.map((sub: any, idx: number) => {
                                const cfg = STATUS_CONFIG[sub.status] || { label: sub.status, color: 'text-muted-foreground', bg: 'bg-muted/30' };
                                const daysLeft = ['revision_requested', 'rejected'].includes(sub.status) ? getDaysRemaining(sub.updated_at) : null;
                                const isUrgent = daysLeft !== null && daysLeft <= 5;

                                return (
                                    <Card 
                                        key={sub.id} 
                                        className={cn(
                                            "group relative border-border/40 bg-background/50 hover:bg-background transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5",
                                            isUrgent ? "border-orange-500/20" : ""
                                        )}
                                    >
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row min-h-56">
                                                {/* Left Panel: Status & Info */}
                                                <div className="lg:w-1/3 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border/20 bg-muted/5 group-hover:bg-transparent transition-colors">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className="px-3 py-1 text-[10px] font-black font-mono tracking-widest rounded-lg bg-background shadow-sm border-primary/20">
                                                                {sub.paperId}
                                                            </Badge>
                                                            <Badge className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border-none shadow-sm", cfg.bg, cfg.color)}>
                                                                {cfg.label}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-500 min-h-12">
                                                            {sub.title || "Untitled Manuscript"}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-4 pt-4">
                                                        <div className="flex -space-x-2 overflow-hidden">
                                                            {/* Placeholder for co-authors or editor */}
                                                            <div className="flex h-6 w-6 rounded-full ring-2 ring-background bg-primary/10 items-center justify-center text-[8px] font-black">AU</div>
                                                            {sub.volumeNumber && <div className="flex h-6 w-6 rounded-full ring-2 ring-background bg-emerald-500/10 items-center justify-center text-[8px] font-black text-emerald-600">PUB</div>}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">
                                                           {new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right Panel: Lifecycle & Actions */}
                                                <div className="lg:w-2/3 p-8 flex flex-col justify-between gap-8 bg-background/50">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Manuscript Lifecycle Roadmap</span>
                                                            {daysLeft !== null && (
                                                                <span className={cn(
                                                                    "text-[10px] font-black uppercase flex items-center gap-2", 
                                                                    isUrgent ? "text-rose-500 animate-pulse" : "text-orange-500"
                                                                )}>
                                                                    <Timer className="w-3.5 h-3.5" /> 
                                                                    {daysLeft > 0 ? `${daysLeft}d Remaining` : "Window Closed"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <SubmissionProgress status={sub.status} />
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-end gap-3">
                                                       {/* Priority Action (Conditional) */}
                                                       {sub.status === 'published' && sub.finalPdfUrl ? (
                                                           <Button asChild size="lg" className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20">
                                                               <Link href={sub.finalPdfUrl} target="_blank" className="flex items-center gap-2">
                                                                   <BookOpen className="w-4 h-4" /> Download Final PDF
                                                               </Link>
                                                           </Button>
                                                       ) : (sub.status === 'accepted' || sub.status === 'payment_pending') && sub.paymentStatus !== 'paid' ? (
                                                            <Button asChild size="lg" className="h-12 px-6 bg-primary hover:bg-primary/90 text-white dark:text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-primary/20">
                                                                <Link href={`/author/payments`} className="flex items-center gap-2">
                                                                    <CreditCard className="w-4 h-4" /> Finalize Publication
                                                                </Link>
                                                            </Button>
                                                       ) : ['revision_requested', 'rejected'].includes(sub.status) && daysLeft !== null && daysLeft > 0 ? (
                                                            <Button asChild size="lg" className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-orange-500/20">
                                                                <Link href={`/author/submissions/${sub.id}/resubmit`} className="flex items-center gap-2">
                                                                    <Upload className="w-4 h-4" /> Upload Revision
                                                                </Link>
                                                            </Button>
                                                       ) : null}

                                                       {/* Secondary Actions */}
                                                       <Button asChild variant="outline" className="h-12 px-6 border-border/50 hover:border-primary/40 text-[10px] font-black uppercase tracking-widest rounded-2xl">
                                                            <Link href={`/author/submissions/${sub.id}`} className="flex items-center gap-2">
                                                                Full Dossier <ArrowRight className="w-4 h-4" />
                                                            </Link>
                                                       </Button>
                                                       <Button asChild variant="ghost" className="h-12 w-12 p-0 rounded-2xl text-muted-foreground hover:text-primary">
                                                            <Link href={`/track?id=${sub.paperId}`}>
                                                                <ExternalLink className="w-5 h-5" />
                                                            </Link>
                                                       </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Research Impact & Intelligent Assistance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Research Impact Widget */}
                    <Card className="md:col-span-1 bg-background border-border/40 rounded-[3rem] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 relative">
                        <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Research Impact</h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Global reach of your published manuscripts across IJITEST platforms and indexed databases.
                                </p>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-border/40">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-muted-foreground">Total Views</span>
                                    <span className="text-sm font-black text-foreground tabular-nums">1,204</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-muted-foreground">PDF Downloads</span>
                                    <span className="text-sm font-black text-foreground tabular-nums">482</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-primary">Global Citations</span>
                                    <span className="text-sm font-black text-primary tabular-nums">12</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 bg-linear-to-br from-primary/5 to-transparent border-primary/10 rounded-[3rem] overflow-hidden group">
                        <CardContent className="p-10 flex flex-col sm:flex-row gap-8">
                            <div className="w-16 h-16 rounded-4xl bg-background shadow-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-4 flex-1">
                                <h3 className="text-lg font-bold text-foreground">Publication Strategy & Roadmap</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Our automated branding system applies journal headers, footers, and DOI references upon final acceptance. Ensure your final manuscript adheres to the IJITEST template.
                                </p>
                                <div className="p-4 rounded-2xl bg-background/50 border border-primary/10 flex items-start gap-4 mt-2">
                                    <Timer className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-foreground uppercase tracking-widest">Retention Policy</p>
                                        <p className="text-[11px] text-muted-foreground leading-snug">
                                            Rejected or revision-required manuscripts are held for <strong className="text-primary font-bold">15 days</strong>. Accounts without active scholarly progress after this window are automatically sanitized.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        );
    } catch (error) {
        console.error("Author Dashboard Error:", error);
        return (
            <div className="max-w-7xl mx-auto px-4 py-32">
                <div className="p-24 text-center border border-dashed border-border/50 rounded-[3rem] bg-muted/5">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-6 opacity-40" />
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-2">Systems Interrupted</h2>
                    <p className="text-xs text-muted-foreground">Error orchestrating dashboard components. Please refresh to re-initialize.</p>
                </div>
            </div>
        );
    }
}

function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
