/**
 * Author Dashboard - Modernized for IJITEST
 */
import {
    FileStack, Clock, CheckCircle, BookOpen, ArrowRight,
    AlertCircle, Upload, ExternalLink, CreditCard, Timer,
    FileText, TrendingUp, Sparkles
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
    submitted: { label: 'Reviewing', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    editor_assigned: { label: 'Assigned', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    under_review: { label: 'Peer review', color: 'text-amber-600', bg: 'bg-amber-500/10' },
    revision_requested: { label: 'Revision', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    accepted: { label: 'Accepted', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-500/10' },
    payment_pending: { label: 'Payment', color: 'text-purple-600', bg: 'bg-purple-500/10' },
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
            { label: 'Submitted', value: submissions.length, icon: <FileStack className="w-5 h-5 text-primary" /> },
            { label: 'Reviewing', value: submissions.filter((s: any) => ['submitted', 'editor_assigned', 'under_review'].includes(s.status)).length, icon: <Clock className="w-5 h-5 text-amber-500" /> },
            { label: 'Accepted', value: submissions.filter((s: any) => ['accepted', 'payment_pending', 'published'].includes(s.status)).length, icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
            { label: 'Published', value: submissions.filter((s: any) => s.status === 'published').length, icon: <BookOpen className="w-5 h-5 text-blue-500" /> },
        ];

        return (
            <section className="space-y-6 pb-20 max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-medium text-primary/60">Overview</span>
                        </div>
                        <h1>
                           Welcome back, <span className="text-primary">{session.user.name?.split(' ')[0] || 'Scholar'}</span>
                        </h1>
                        <p className="max-w-2xl">
                            Manage your submissions and track your papers.
                        </p>
                    </div>
                    <Button asChild className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all text-xs">
                        <Link href="/submit" className="flex items-center gap-2">
                            <PlusIcon className="w-4 h-4" /> Submit Paper
                        </Link>
                    </Button>
                </header>

                {/* Performance Snapshot */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-border/40 bg-background hover:border-primary/30 transition-all rounded-xl">
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="opacity-60 mb-1">{stat.label}</p>
                                        <p className="text-lg tabular-nums">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Submissions Management */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2">
                           My Submissions
                        </h2>
                    </div>

                    {submissions.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/50 bg-muted/5 py-20 text-center rounded-xl">
                            <CardContent className="flex flex-col items-center gap-4">
                                <FileText className="w-12 h-12 text-primary/20" />
                                <div className="space-y-1">
                                    <h3>No submissions found</h3>
                                    <p>
                                        You haven't submitted any papers yet.
                                    </p>
                                </div>
                                <Button asChild size="sm" className="mt-2 bg-primary text-white font-semibold rounded-lg px-8">
                                    <Link href="/submit">Submit Paper</Link>
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
                                            "border-border/40 bg-background hover:border-primary/20 transition-all rounded-xl overflow-hidden",
                                            isUrgent ? "border-orange-500/20" : ""
                                        )}
                                    >
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row min-h-56">
                                                {/* Left Panel: Status & Info */}
                                                <div className="lg:w-1/3 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border/20 bg-muted/5 transition-colors">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-semibold rounded bg-background border-primary/20">
                                                                {sub.paperId}
                                                            </Badge>
                                                            <Badge className={cn("px-2 py-0.5 text-[10px] font-semibold rounded border-none shadow-sm", cfg.bg, cfg.color)}>
                                                                {cfg.label}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="leading-snug">
                                                            {sub.title || "Untitled Manuscript"}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-4 pt-4">
                                                        <span className="text-[10px] font-medium text-muted-foreground/60">
                                                           {new Date(sub.submittedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right Panel: Lifecycle & Actions */}
                                                <div className="lg:w-2/3 p-6 flex flex-col justify-between gap-6 bg-background">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-muted-foreground">Progress</span>
                                                            {daysLeft !== null && (
                                                                <span className={cn(
                                                                    "text-[10px] font-semibold flex items-center gap-1.5", 
                                                                    isUrgent ? "text-rose-500 animate-pulse" : "text-orange-500"
                                                                )}>
                                                                    <Timer className="w-3.5 h-3.5" /> 
                                                                    {daysLeft > 0 ? `${daysLeft} days remaining` : "Window closed"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <SubmissionProgress status={sub.status} />
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                                       {sub.status === 'published' && sub.finalPdfUrl ? (
                                                           <Button asChild size="sm" className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm">
                                                               <Link href={sub.finalPdfUrl} target="_blank" className="flex items-center gap-2">
                                                                   <BookOpen className="w-4 h-4" /> PDF
                                                               </Link>
                                                           </Button>
                                                       ) : (sub.status === 'accepted' || sub.status === 'payment_pending') && sub.paymentStatus !== 'paid' ? (
                                                            <Button asChild size="sm" className="h-9 px-4 bg-primary hover:bg-primary/90 text-white font-semibold text-xs rounded-lg shadow-sm">
                                                                <Link href={`/author/payments`} className="flex items-center gap-2">
                                                                    <CreditCard className="w-4 h-4" /> Pay Fee
                                                                </Link>
                                                            </Button>
                                                       ) : ['revision_requested', 'rejected'].includes(sub.status) && daysLeft !== null && daysLeft > 0 ? (
                                                            <Button asChild size="sm" className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-lg shadow-sm">
                                                                <Link href={`/author/submissions/${sub.id}/resubmit`} className="flex items-center gap-2">
                                                                    <Upload className="w-4 h-4" /> Resubmit
                                                                </Link>
                                                            </Button>
                                                       ) : null}
                                                       <Button asChild variant="outline" size="sm" className="h-9 px-4 border-border/50 text-xs font-semibold rounded-lg">
                                                            <Link href={`/author/submissions/${sub.id}`} className="flex items-center gap-2">
                                                                Details <ArrowRight className="w-3.5 h-3.5" />
                                                            </Link>
                                                       </Button>
                                                       <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-primary">
                                                            <Link href={`/track?id=${sub.paperId}`}>
                                                                <ExternalLink className="w-4 h-4" />
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

                {/* Research Impact & Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1 bg-background border-border/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <h3 className="">Statistics</h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Track the reach of your manuscripts.
                                </p>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-border/40">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-muted-foreground">Views</span>
                                    <span className="text-sm font-bold text-foreground tabular-nums">1,204</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-muted-foreground">Downloads</span>
                                    <span className="text-sm font-bold text-foreground tabular-nums">482</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-primary">Citations</span>
                                    <span className="text-sm font-bold text-primary tabular-nums">12</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 bg-primary/5 border-primary/10 rounded-xl overflow-hidden">
                        <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-3 flex-1">
                                <h3 className="">Information</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Our system automatically formats your accepted manuscripts with journal headers and DOI references.
                                </p>
                                <div className="p-4 rounded-lg bg-background/50 border border-primary/10 flex items-start gap-3 mt-1">
                                    <Timer className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="opacity-80">Note</p>
                                        <p className="opacity-60">
                                            Rejected or revision-required manuscripts are held for 15 days.
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
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="p-12 text-center border border-dashed border-border/50 rounded-xl bg-muted/5">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4 opacity-40" />
                    <h2 className="text-sm font-bold mb-1">Error</h2>
                    <p className="text-xs text-muted-foreground">Unable to load dashboard. Please try refreshing the page.</p>
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
