import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAuthorDashboard, checkResubmissionEligibility } from "@/actions/author-submissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Upload, ExternalLink, Clock, Timer } from "lucide-react";

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    submitted: { label: 'Under Review', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    editor_assigned: { label: 'Editor Assigned', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    under_review: { label: 'Peer Review', color: 'text-amber-600', bg: 'bg-amber-500/10' },
    revision_requested: { label: 'Revision Required', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    accepted: { label: 'Accepted', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Not Accepted', color: 'text-rose-600', bg: 'bg-rose-500/10' },
    payment_pending: { label: 'Payment Pending', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    published: { label: 'Published', color: 'text-emerald-700', bg: 'bg-emerald-500/15' },
};

export default async function AuthorSubmissionsList() {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    if (session.user.role !== 'author') redirect(`/${session.user.role}`);

    const dashboardResponse = await getAuthorDashboard();
    const submissions = dashboardResponse.data?.submissions || [];

    // Attach eligibility data in parallel
    const withEligibility = await Promise.all(
        submissions.map(async (sub: any) => {
            if (['revision_requested', 'rejected'].includes(sub.status)) {
                const el = await checkResubmissionEligibility(sub.id);
                return { ...sub, eligibility: el };
            }
            return { ...sub, eligibility: null };
        })
    );

    return (
        <section className="space-y-6 pb-20">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/5 pb-6">
                <div>
                    <h1 className="font-black text-foreground tracking-widest uppercase text-2xl">My Submissions</h1>
                    <p className="text-xs text-muted-foreground font-medium mt-1">All manuscripts you have submitted to IJITEST</p>
                </div>
                <Button asChild className="bg-primary text-white dark:text-black hover:bg-primary/90 font-bold uppercase text-xs rounded-xl h-10 px-5">
                    <Link href="/submit">+ New Submission</Link>
                </Button>
            </header>

            {withEligibility.length === 0 ? (
                <Card className="border-dashed border-2 border-border/50 bg-muted/10 py-20 text-center rounded-xl">
                    <CardContent className="flex flex-col items-center gap-3 text-muted-foreground">
                        <FileText className="w-10 h-10 opacity-20" />
                        <span className="font-bold uppercase tracking-widest text-xs">No Submissions</span>
                        <Button asChild size="sm" className="mt-2 bg-primary text-white dark:text-black hover:bg-primary/90 font-bold uppercase text-[10px] rounded-lg">
                            <Link href="/submit">Start Your First Submission</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {withEligibility.map((sub: any) => {
                        const cfg = STATUS_CONFIG[sub.status] || { label: sub.status, color: 'text-muted-foreground', bg: 'bg-muted/30' };
                        const eligible = sub.eligibility?.eligible;
                        const daysLeft = sub.eligibility?.daysRemaining;
                        const isUrgent = eligible && daysLeft <= 5;

                        return (
                            <Card key={sub.id} className={`border-border/50 bg-background hover:shadow-md transition-all group ${isUrgent ? 'ring-1 ring-orange-400/40' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline" className="text-[9px] font-mono">{sub.paper_id}</Badge>
                                                <Badge className={`text-[9px] font-bold border-none uppercase ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                                            </div>
                                            <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                {sub.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                                {daysLeft !== undefined && daysLeft !== null && (
                                                    <span className={`flex items-center gap-1 font-bold ${isUrgent ? 'text-orange-600' : 'text-amber-600'}`}>
                                                        <Timer className="w-3 h-3" />
                                                        {daysLeft > 0 ? `${daysLeft}d to resubmit` : 'Window expired'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 shrink-0">
                                            <Button asChild variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase rounded-lg">
                                                <Link href={`/author/submissions/${sub.id}`} className="flex items-center gap-1.5">Details <ExternalLink className="w-3 h-3" /></Link>
                                            </Button>
                                            {eligible && daysLeft > 0 && (
                                                <Button asChild size="sm" className="h-8 text-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase rounded-lg">
                                                    <Link href={`/author/submissions/${sub.id}/resubmit`} className="flex items-center gap-1.5">
                                                        <Upload className="w-3 h-3" /> Resubmit
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
        </section>
    );
}
