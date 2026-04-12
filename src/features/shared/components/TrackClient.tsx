'use client'

import { Search, Loader2, CheckCircle2, ShieldAlert, FileText, Calendar, CreditCard, ArrowRight, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrackManuscript } from '@/hooks/queries/usePublic';

interface TrackClientProps {
    settings: Record<string, string>;
}

import { LucideIcon } from 'lucide-react';
 
interface MilestoneProps {
    title: string;
    date?: string;
    description: string;
    icon: LucideIcon;
    active: boolean;
    last?: boolean;
}
 
function Milestone({ title, date, description, icon: Icon, active, last }: MilestoneProps) {
    return (
        <div className="flex gap-4 relative items-start">
            {!last && (
                <div className="absolute left-5 top-10 bottom-0 w-[1px] bg-border/50" />
            )}

            <div className={`relative z-10 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${active
                ? 'bg-primary text-white border-primary'
                : 'bg-muted/20 text-muted-foreground border-border/50'
                }`}>
                <Icon className="w-4 h-4" />
            </div>

            <div className="pb-8 pt-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className={`text-sm font-semibold m-0 ${active ? 'text-primary' : 'text-muted-foreground/50'}`}>{title}</h3>
                    {date && (
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50 font-mono">
                            {new Date(date).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <p className={`text-xs leading-relaxed ${active ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}>{description}</p>
            </div>
        </div>
    );
}

export default function TrackClient({ settings }: TrackClientProps) {
    const searchParams = useSearchParams();
    const [paperIdInput, setPaperIdInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [searchTriggered, setSearchTriggered] = useState(false);

    // Use the hook with manual activation
    const { data, isLoading, isError, error, isSuccess } = useTrackManuscript(
        paperIdInput,
        emailInput,
        searchTriggered
    );

    const manuscript = data?.success ? data.data?.manuscript : null;
    const errorMessage = data?.success ? null : (data?.error || (error instanceof Error ? error instanceof Error ? error.message : String(error) : null));

    const resultsRef = useRef<HTMLDivElement>(null);
    const journalShortName = settings.journal_short_name || "IJITEST";

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setPaperIdInput(id);
        }
    }, [searchParams]);

    useEffect(() => {
        if ((isSuccess || isError) && resultsRef.current) {
            const offset = 80;
            const elementPosition = resultsRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, [isSuccess, isError]);

    async function handleTrack(e: React.FormEvent) {
        e.preventDefault();
        setSearchTriggered(true);
    }

    const isStepActive = (step: 'submitted' | 'review' | 'decision') => {
        if (!manuscript) return false;
        const s = manuscript.status;
        if (step === 'submitted') return true;
        if (step === 'review') return ['under_review', 'accepted', 'rejected', 'published'].includes(s);
        if (step === 'decision') return ['accepted', 'rejected', 'published'].includes(s);
        return false;
    };

    return (
        <section className="container-responsive py-12 sm:py-24">
            {/* Tracking Form */}
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#000066] p-8 sm:p-12 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                        <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                            <Search className="w-8 h-8" />
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                            <h2 className="text-xl font-semibold m-0 text-white">Track Manuscript</h2>
                            <p className="text-white/60 text-sm m-0 flex items-center justify-center sm:justify-start gap-2">
                                <ShieldAlert className="w-4 h-4 text-white/50" /> Secure Access
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-12">
                    <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Manuscript ID</label>
                            <div className="relative">
                                <Input
                                    value={paperIdInput}
                                    onChange={(e) => {
                                        setPaperIdInput(e.target.value);
                                        setSearchTriggered(false);
                                    }}
                                    required
                                    className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/20 text-primary px-5 transition-all text-sm"
                                    placeholder={`${journalShortName}-2026-XXX`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                                    <FileText className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => {
                                        setEmailInput(e.target.value);
                                        setSearchTriggered(false);
                                    }}
                                    required
                                    className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/20 text-primary px-5 text-sm transition-all"
                                    placeholder="author@institution.edu"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                                    <User className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-[#000066] hover:bg-[#000088] text-white rounded-xl shadow-sm transition-all active:scale-[0.99] cursor-pointer font-bold text-xs tracking-wider uppercase"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        Searching <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Track Manuscript <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                            <p className="text-center mt-6 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                Global Publication Protocol • v4.0
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div id="tracking-results" ref={resultsRef} className="mt-16 sm:mt-24 scroll-mt-32">
                {isSuccess && manuscript && (
                    <div className="space-y-12">
                        <div className="p-8 sm:p-12 bg-card border border-border/50 rounded-xl shadow-sm relative overflow-hidden border-t-4 border-t-secondary/40">
                            <section className="mb-12 space-y-8 relative z-10">
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-primary/5 text-primary border-primary/20 px-4 h-8 rounded-lg">
                                            Status: {manuscript.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded border border-border/50">
                                            ID: {manuscript.paper_id}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> {new Date(manuscript.submitted_at).getFullYear()}
                                    </div>
                                </div>

                                <h2 className="text-xl xl:text-2xl font-serif font-semibold text-primary leading-tight max-w-4xl border-l-4 border-secondary/20 pl-6">
                                    {manuscript.title}
                                </h2>

                                <div className="flex items-center gap-4 text-primary pt-2">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Corresponding Author</p>
                                        <p className="text-sm font-semibold">{manuscript.author_name}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-10 pt-12 border-t border-border/50 max-w-3xl">
                                <div className="flex items-center gap-3 mb-8">
                                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Manuscript Timeline</p>
                                </div>

                                <div className="space-y-4">
                                    <Milestone
                                        title="Manuscript Received"
                                        date={manuscript.submitted_at}
                                        description="Initial submission received and queued for editorial screening."
                                        icon={FileText}
                                        active={isStepActive('submitted')}
                                    />
                                    <Milestone
                                        title="Peer Review"
                                        date={manuscript.review_started_at}
                                        description="Assigned to experts for technical evaluation."
                                        icon={Search}
                                        active={isStepActive('review')}
                                    />
                                    <Milestone
                                        title="Editorial Decision"
                                        date={manuscript.status !== 'under_review' && manuscript.status !== 'submitted' ? manuscript.updated_at : undefined}
                                        description={
                                            manuscript.status === 'accepted' ? "Accepted for publication in the upcoming volume." :
                                            manuscript.status === 'rejected' ? "Returned following scientific evaluation." :
                                            manuscript.status === 'published' ? "Published and indexed in digital archives." :
                                            "Awaiting final verification."
                                        }
                                        icon={ShieldAlert}
                                        active={isStepActive('decision')}
                                        last
                                    />
                                </div>
                            </section>

                            {/* Action Cards */}
                            <div className="mt-12 pt-12 border-t border-border/50">
                                {manuscript.status === 'accepted' && (
                                    <div className="bg-[#000066] p-8 sm:p-12 rounded-xl text-white relative overflow-hidden">
                                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                                        <CreditCard className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-xl font-semibold m-0 leading-none">Access Fees Required</h3>
                                                </div>
                                                <p className="text-white/60 text-sm leading-relaxed max-w-2xl border-l-2 border-white/20 pl-6">
                                                    Your manuscript has been approved. Please finalize the Article Processing Charge (APC) to proceed with publication.
                                                </p>
                                            </div>
                                            <Button asChild size="lg" className="h-12 px-8 bg-white text-primary hover:bg-white/90 rounded-lg shadow-sm transition-all shrink-0 font-bold text-xs tracking-wider uppercase">
                                                <Link href={`/payment/${manuscript.paper_id}`} className="flex items-center gap-2">
                                                    Process Payment <CreditCard className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {manuscript.status === 'published' && (
                                    <div className="bg-emerald-50 p-8 sm:p-12 rounded-xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="space-y-3 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-emerald-800 m-0">Fully Indexed</h3>
                                            </div>
                                            <p className="text-emerald-700/70 text-sm max-w-2xl">
                                                Your research is now live in the global scientific archives.
                                            </p>
                                        </div>
                                        <Button asChild size="lg" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all shrink-0 font-bold text-xs tracking-wider uppercase">
                                            <Link href={`/archive`} className="flex items-center gap-2">
                                                View in Archive <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {manuscript.status === 'rejected' && (
                                    <div className="p-8 sm:p-12 bg-destructive/5 border border-destructive/10 rounded-xl space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-destructive">Editorial Decision</h3>
                                            <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                                                The committee has concluded its review. While the current version does not meet publication criteria, please see the feedback below.
                                            </p>
                                        </div>
                                        {manuscript.reviewer_feedback && manuscript.reviewer_feedback.length > 0 && (
                                            <div className="grid grid-cols-1 gap-4">
                                                {manuscript.reviewer_feedback.map((feedback: string, i: number) => (
                                                    <div key={i} className="p-6 bg-card border border-border/50 rounded-xl text-sm leading-relaxed flex gap-4">
                                                        <div className="w-1 h-auto bg-destructive/20 rounded-full shrink-0" />
                                                        <div className="italic">"{feedback}"</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {(isError || (data && 'error' in data)) && (
                    <div className="p-12 sm:p-20 bg-card border border-border/50 rounded-xl text-center space-y-8 max-w-2xl mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-destructive/5 rounded-xl flex items-center justify-center mx-auto text-destructive border border-destructive/10">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold m-0">Access Denied</h2>
                            <p className="text-muted-foreground text-sm m-0">
                                Manuscript not found or credentials mismatched.
                            </p>
                            <p className="text-destructive/60 text-xs italic">"{errorMessage}"</p>
                        </div>
                        <Button
                            onClick={() => setSearchTriggered(false)}
                            className="h-12 px-10 bg-[#000066] hover:bg-[#000088] text-white rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 font-bold text-xs tracking-wider uppercase"
                        >
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
