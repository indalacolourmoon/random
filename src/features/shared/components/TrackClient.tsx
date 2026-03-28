'use client'

import { Search, Loader2, CheckCircle2, Clock, ShieldAlert, FileText, Calendar, CreditCard, ChevronRight, Check, ArrowRight, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrackManuscript } from '@/hooks/queries/usePublic';

interface TrackClientProps {
    settings: Record<string, string>;
}

function Milestone({ title, date, description, icon: Icon, active, last }: { title: string, date?: string, description: string, icon: any, active: boolean, last?: boolean }) {
    return (
        <div className="flex gap-8 relative items-start">
            {!last && (
                <div className="absolute left-6 top-12 bottom-0 w-[2px] bg-primary/5 -translate-x-1/2 overflow-hidden">
                    {active && <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="w-full bg-secondary"
                    />}
                </div>
            )}

            <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 border-2 ${active
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white text-primary/20 border-primary/5'
                }`}>
                <Icon className={`w-5 h-5`} />
            </div>

            <div className="pb-12 pt-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <h3 className={`text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest uppercase ${active ? 'text-primary' : 'text-primary/20'}`}>{title}</h3>
                    {date && (
                        <Badge variant="secondary" className="text-xs font-black tracking-widest px-3 h-5 rounded-full bg-primary/5 text-primary/60 border-primary/10 uppercase">
                            {new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </Badge>
                    )}
                </div>
                <p className={`text-xs font-medium leading-relaxed border-l-2 pl-4 ${active ? 'text-primary/60 border-secondary/50' : 'text-primary/10 border-primary/5'}`}>{description}</p>
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

    const manuscript = data && 'success' in data ? data.manuscript : null;
    const errorMessage = data && 'error' in data ? data.error : (error as any)?.message;

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
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
            {/* Tracking Form */}
            <section className="bg-white border border-primary/5 rounded-[2.5rem] shadow-sm overflow-hidden relative group border-l-[6px] border-l-primary/10 transition-all hover:shadow-xl">
                <div className="bg-primary p-10 sm:p-14 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/20">
                            <Search className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-black tracking-widest uppercase m-0">Search Manuscript</h2>
                            <p className="text-white/40 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest uppercase m-0">Enter your submission credentials</p>
                        </div>
                    </div>
                </div>
                <div className="p-10 sm:p-14">
                    <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-primary/40 tracking-widest uppercase ml-2">Manuscript ID</label>
                            <Input
                                value={paperIdInput}
                                onChange={(e) => {
                                    setPaperIdInput(e.target.value);
                                    setSearchTriggered(false);
                                }}
                                required
                                className="h-14 rounded-2xl bg-primary/5 border-primary/10 focus-visible:ring-secondary/20 font-bold text-primary shadow-inner px-6"
                                placeholder={`${journalShortName}-2026-001`}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-primary/40 tracking-widest uppercase ml-2">Author Email</label>
                            <Input
                                type="email"
                                value={emailInput}
                                onChange={(e) => {
                                    setEmailInput(e.target.value);
                                    setSearchTriggered(false);
                                }}
                                required
                                className="h-14 rounded-2xl bg-primary/5 border-primary/10 focus-visible:ring-secondary/20 font-bold text-primary shadow-inner px-6"
                                placeholder="u.author@example.com"
                            />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-primary hover:bg-primary/95 text-white font-black text-sm  tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] cursor-pointer"
                            >
                                {isLoading ? (
                                    <>Searching Archives... <Loader2 className="ml-3 w-5 h-5 animate-spin" /></>
                                ) : (
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        Track Manuscript Status <ArrowRight className="ml-2 w-5 h-5" />
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Results Section */}
            <div id="tracking-results" ref={resultsRef} className="mt-16 sm:mt-24 scroll-mt-32">
                <AnimatePresence mode="wait">
                    {isSuccess && manuscript && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="space-y-12"
                        >
                            <div className="p-10 sm:p-14 bg-white border border-primary/5 rounded-[3rem] shadow-sm border-l-[6px] border-l-secondary">
                                <section className="mb-12 space-y-8">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <Badge className="bg-secondary text-white border-none text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black  tracking-[0.3em] px-4 h-6 rounded-full shadow-lg shadow-secondary/20 uppercase">
                                            Status: {manuscript.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-[11px] font-black text-primary/40  tracking-widest bg-primary/5 px-3 py-1 rounded-lg border border-primary/5"># {manuscript.paper_id}</span>
                                    </div>
                                    <h2 className="font-black text-primary leading-wider tracking-widest uppercase underline-offset-8 decoration-secondary/30 underline decoration-2 m-0">
                                        {manuscript.title}
                                    </h2>
                                    <div className="flex items-center gap-4 text-primary font-black  tracking-widest text-[11px]">
                                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/5">
                                            <User className="w-5 h-5 text-secondary" />
                                        </div>
                                        {manuscript.author_name}
                                    </div>
                                </section>

                                <section className="space-y-10 pt-12 border-t border-primary/5 max-w-2xl">
                                    <h3 className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/30 tracking-widest uppercase mb-12 flex items-center gap-4 text-center sm:text-left">
                                        Publication Journey
                                    </h3>

                                    <div className="space-y-4">
                                        <Milestone
                                            title="Manuscript Received"
                                            date={manuscript.submitted_at}
                                            description="Initial version received and queued for mandatory editorial screening."
                                            icon={FileText}
                                            active={isStepActive('submitted')}
                                        />
                                        <Milestone
                                            title="Under Review"
                                            date={manuscript.review_started_at}
                                            description="Assigned to independent global domain experts for peer evaluation."
                                            icon={Search}
                                            active={isStepActive('review')}
                                        />
                                        <Milestone
                                            title="Final Verdict"
                                            date={manuscript.status !== 'under_review' && manuscript.status !== 'submitted' ? manuscript.updated_at : undefined}
                                            description={
                                                manuscript.status === 'accepted' ? "Elite approval granted for publication." :
                                                    manuscript.status === 'rejected' ? "Manuscript returned following expert review." :
                                                        "Awaiting final verification from the editorial board."
                                            }
                                            icon={ShieldAlert}
                                            active={isStepActive('decision')}
                                            last
                                        />
                                    </div>
                                </section>

                                {/* Conditional Action Cards */}
                                <div className="mt-12 pt-12 border-t border-primary/5">
                                    {manuscript.status === 'accepted' && (
                                        <section className="bg-primary p-1 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                            <div className="bg-slate-900/40 backdrop-blur-xl p-10 sm:p-14 rounded-[2.4rem] relative z-10">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                                    <div className="space-y-4">
                                                        <h3 className="text-white font-black tracking-widest uppercase m-0">Action Required: Payment</h3>
                                                        <p className="text-white/60 font-medium leading-relaxed max-w-xl border-l-2 border-secondary/50 pl-6 ">
                                                            "Your research is approved for publication. Please complete the hosting fee to finalize indexing and SJIF impact assessment."
                                                        </p>
                                                    </div>
                                                    <Button asChild size="lg" className="h-14 px-10 bg-secondary hover:bg-secondary/90 text-white font-black text-xs  tracking-[0.2em] rounded-2xl shadow-xl transition-all shrink-0 cursor-pointer">
                                                        <Link href={`/payment/${manuscript.paper_id}`} className="flex items-center cursor-pointer">
                                                            APC Payment <CreditCard className="w-5 h-5 ml-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {manuscript.status === 'rejected' && (
                                        <section className="p-10 bg-destructive/5 border border-destructive/10 rounded-[2.5rem] space-y-6">
                                            <h4 className="text-xl font-black text-primary tracking-wider ">Editorial Feedback</h4>
                                            <p className="text-sm text-primary/60 font-medium ">The editorial board has reached a decision. Please review the feedback below for future revisions.</p>
                                            {manuscript.reviewer_feedback && manuscript.reviewer_feedback.length > 0 && (
                                                <div className="space-y-4">
                                                    {manuscript.reviewer_feedback.map((feedback: string, i: number) => (
                                                        <div key={i} className="p-6 bg-white rounded-2xl border border-destructive/5 text-sm text-primary/70 leading-relaxed  relative pl-8">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/20 rounded-l-2xl" />
                                                            "{feedback}"
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {(isError || (data && 'error' in data)) && (
                        <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="p-12 sm:p-20 bg-white border border-primary/5 rounded-[3.5rem] shadow-sm text-center space-y-8 max-w-2xl mx-auto border-l-[6px] border-l-destructive/10">
                                <div className="w-16 h-16 bg-destructive/5 rounded-2xl flex items-center justify-center mx-auto text-destructive">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="font-black text-primary tracking-wider m-0">Tracking Failed</h2>
                                    <p className="text-primary/40 font-black text-xs tracking-widest uppercase m-0">"{errorMessage}"</p>
                                </div>
                                <Button
                                    onClick={() => setSearchTriggered(false)}
                                    className="h-14 px-10 bg-primary hover:bg-primary/95 text-white font-black text-xs  tracking-[0.2em] rounded-2xl shadow-xl transition-all cursor-pointer"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
