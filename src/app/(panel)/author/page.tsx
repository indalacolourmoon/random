import {
    FileStack, Clock, CheckCircle, BookOpen, ArrowRight,
    AlertCircle, Upload, ExternalLink, CreditCard, Copy, Timer,
    FileText, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAuthorDashboard } from '@/actions/author-submissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

        const { submissions } = await getAuthorDashboard();

        const stats = [
            { label: 'Total Submitted', value: submissions.length, icon: <FileStack className="w-5 h-5 text-primary" /> },
            { label: 'Under Review', value: submissions.filter((s: any) => ['submitted', 'editor_assigned', 'under_review'].includes(s.status)).length, icon: <Clock className="w-5 h-5 text-amber-500" /> },
            { label: 'Accepted', value: submissions.filter((s: any) => ['accepted', 'payment_pending', 'published'].includes(s.status)).length, icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
            { label: 'Published', value: submissions.filter((s: any) => s.status === 'published').length, icon: <BookOpen className="w-5 h-5 text-blue-500" /> },
        ];

        return (
            <section className="space-y-6 pb-20">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                    <div className="space-y-2">
                        <h1 className="font-black text-foreground tracking-widest uppercase leading-none text-2xl xl:text-3xl">
                            Author Portal
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2">
                            Track and manage your research submissions, {session.user.name || 'Author'}.
                        </p>
                    </div>
                    <Button asChild className="bg-primary text-white dark:text-black hover:bg-primary/90 font-bold uppercase text-xs rounded-xl shadow-sm h-11 px-6">
                        <Link href="/submit">+ New Submission</Link>
                    </Button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-border/50 bg-background/50 backdrop-blur-sm group hover:border-primary/20 transition-all">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-primary/60 tracking-widest uppercase">{stat.label}</p>
                                    <p className="font-black text-2xl text-foreground">{stat.value}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center transition-transform group-hover:scale-110">
                                    {stat.icon}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Submissions */}
                <div className="space-y-4">
                    <h2 className="text-[10px] font-black text-primary/60 tracking-widest uppercase">Your Manuscripts</h2>

                    {submissions.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/50 bg-muted/10 py-20 text-center rounded-xl">
                            <CardContent className="flex flex-col items-center gap-3 text-muted-foreground">
                                <FileText className="w-10 h-10 opacity-20" />
                                <span className="font-bold uppercase tracking-widest text-xs">No Submissions Yet</span>
                                <p className="text-xs opacity-70 max-w-xs">Submit your first research manuscript to get started.</p>
                                <Button asChild size="sm" className="mt-2 bg-primary text-white dark:text-black hover:bg-primary/90 font-bold uppercase text-[10px] rounded-lg">
                                    <Link href="/submit">Start Submission</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {submissions.map((sub: any) => {
                                const cfg = STATUS_CONFIG[sub.status] || { label: sub.status, color: 'text-muted-foreground', bg: 'bg-muted/30' };
                                const daysLeft = ['revision_requested', 'rejected'].includes(sub.status) ? getDaysRemaining(sub.updated_at) : null;
                                const isUrgent = daysLeft !== null && daysLeft <= 5;

                                return (
                                    <Card key={sub.id} className={`border-border/50 bg-background group hover:shadow-md transition-all overflow-hidden ${isUrgent ? 'ring-1 ring-orange-400/40' : ''}`}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <Badge variant="outline" className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5">
                                                            {sub.paper_id}
                                                        </Badge>
                                                        <Badge className={`text-[9px] font-bold uppercase border-none ${cfg.bg} ${cfg.color}`}>
                                                            {cfg.label}
                                                        </Badge>
                                                        {sub.payment_status === 'paid' && (
                                                            <Badge className="text-[9px] border-none bg-emerald-500/10 text-emerald-600">Payment Confirmed</Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                                        {sub.title || "Untitled Manuscript"}
                                                    </h3>
                                                    <p className="text-[10px] text-muted-foreground font-medium">
                                                        Submitted {new Date(sub.submitted_at).toLocaleDateString()} &nbsp;·&nbsp;
                                                        Last updated {new Date(sub.updated_at).toLocaleDateString()}
                                                    </p>

                                                    {/* Countdown for revision/rejected */}
                                                    {daysLeft !== null && (
                                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${isUrgent ? 'bg-orange-500/10 text-orange-600' : 'bg-muted/50 text-muted-foreground'}`}>
                                                            <Timer className="w-3.5 h-3.5" />
                                                            {daysLeft > 0
                                                                ? `Resubmission window: ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`
                                                                : 'Resubmission window closed — account will be deactivated'
                                                            }
                                                        </div>
                                                    )}

                                                    {/* Published info */}
                                                    {sub.status === 'published' && sub.volume_number && (
                                                        <p className="text-[10px] text-emerald-600 font-bold">
                                                            Published: Vol. {sub.volume_number}, Issue {sub.issue_number} ({sub.issue_year})
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-wrap sm:flex-col gap-2 items-start sm:items-end shrink-0">
                                                    <Button asChild variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase rounded-lg hover:border-primary/40">
                                                        <Link href={`/author/submissions/${sub.id}`} className="flex items-center gap-1.5">
                                                            Details <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    </Button>

                                                    <Button asChild variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase rounded-lg">
                                                        <Link href={`/track?id=${sub.paper_id}`} className="flex items-center gap-1.5">
                                                            Track <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    </Button>

                                                    {['revision_requested', 'rejected'].includes(sub.status) && daysLeft !== null && daysLeft > 0 && (
                                                        <Button asChild size="sm" className="h-8 text-[10px] font-bold uppercase rounded-lg bg-orange-500 hover:bg-orange-600 text-white">
                                                            <Link href={`/author/submissions/${sub.id}/resubmit`} className="flex items-center gap-1.5">
                                                                <Upload className="w-3 h-3" /> Resubmit
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {(sub.status === 'accepted' || sub.status === 'payment_pending') && sub.apc_amount && parseFloat(sub.apc_amount) > 0 && sub.payment_status !== 'paid' && (
                                                        <Button asChild size="sm" className="h-8 text-[10px] font-bold uppercase rounded-lg bg-primary text-white dark:text-black hover:bg-primary/90">
                                                            <Link href={`/author/payments`} className="flex items-center gap-1.5">
                                                                <CreditCard className="w-3 h-3" /> Pay Now
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {sub.status === 'published' && sub.final_pdf_url && (
                                                        <Button asChild size="sm" className="h-8 text-[10px] font-bold uppercase rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                                                            <Link href={sub.final_pdf_url} target="_blank" className="flex items-center gap-1.5">
                                                                <BookOpen className="w-3 h-3" /> View Paper
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Info banner */}
                <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                        <AlertCircle className="w-5 h-5 text-primary/60 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Submission Guidelines</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                If your paper is marked for revision or rejected, you have <strong>15 days</strong> to submit a revised version.
                                After this period, your account will be deactivated. You may start a fresh submission at any time.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        );
    } catch (error: any) {
        console.error("Author Dashboard Error:", error);
        return (
            <div className="p-24 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs min-h-[500px] flex items-center justify-center rounded-xl bg-muted/10">
                Error loading dashboard. Please try again.
            </div>
        );
    }
}
