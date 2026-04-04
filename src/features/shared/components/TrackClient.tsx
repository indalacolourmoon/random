'use client'

import { Search, Loader2, CheckCircle2, ShieldAlert, FileText, Calendar, CreditCard, ArrowRight, User } from 'lucide-react';
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
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-32 overflow-visible">
            {/* Tracking Form */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-primary/5 rounded-[3rem] shadow-vip overflow-hidden relative group transition-all duration-500 hover:shadow-2xl"
            >
                <div className="bg-primary p-12 sm:p-20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-10">
                        <div className="w-20 h-20 2xl:w-28 2xl:h-28 bg-white/10 rounded-4xl flex items-center justify-center text-white border border-white/20 shadow-2xl backdrop-blur-md">
                            <Search className="w-10 h-10 2xl:w-14 2xl:h-14" />
                        </div>
                        <div className="text-center sm:text-left space-y-3">
                            <h2 className="font-serif font-black text-3xl 2xl:text-6xl tracking-tighter uppercase m-0 leading-none">Manuscript <span className="opacity-40">Registry</span></h2>
                            <p className="text-white/50 text-xs 2xl:text-xl font-bold tracking-[0.4em] uppercase m-0 flex items-center justify-center sm:justify-start gap-3">
                                <ShieldAlert className="w-4 h-4 text-secondary" /> Secure Dossier Access
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-12 sm:p-20 bg-card/50 backdrop-blur-xl">
                    <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] 2xl:text-xs font-black text-primary/40 tracking-[0.3em] uppercase px-2">Access Token (Manuscript ID)</label>
                            <div className="relative group/input">
                                <Input
                                    value={paperIdInput}
                                    onChange={(e) => {
                                        setPaperIdInput(e.target.value);
                                        setSearchTriggered(false);
                                    }}
                                    required
                                    className="h-16 2xl:h-24 rounded-2xl 2xl:rounded-3xl bg-primary/3 border-primary/10 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-primary shadow-inner px-8 text-lg 2xl:text-3xl transition-all"
                                    placeholder={`${journalShortName}-2026-XXX`}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/10">
                                    <FileText className="w-6 h-6 2xl:w-10 2xl:h-10" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] 2xl:text-xs font-black text-primary/40 tracking-[0.3em] uppercase px-2">Registered Correspondent Email</label>
                            <div className="relative group/input">
                                <Input
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => {
                                        setEmailInput(e.target.value);
                                        setSearchTriggered(false);
                                    }}
                                    required
                                    className="h-16 2xl:h-24 rounded-2xl 2xl:rounded-3xl bg-primary/3er-primary/10 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-primary shadow-inner px-8 text-lg 2xl:text-3xl transition-all"
                                    placeholder="author@institution.edu"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/10">
                                    <User className="w-6 h-6 2xl:w-10 2xl:h-10" />
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-6">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 2xl:h-24 bg-primary hover:bg-primary/95 text-white font-black text-xs 2xl:text-2xl tracking-[0.4em] rounded-2xl 2xl:rounded-3xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer uppercase border-t border-white/10"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-4">
                                        Authenticating Access <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        Query Manuscript Database <ArrowRight className="w-6 h-6" />
                                    </div>
                                )}
                            </Button>
                            <p className="text-center mt-6 text-[10px] 2xl:text-base font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                                Global Publication Tracking Protocol v4.0 • Encrypted Connection
                            </p>
                        </div>
                    </form>
                </div>
            </motion.section>

            {/* Results Section */}
            <div id="tracking-results" ref={resultsRef} className="mt-24 sm:mt-40 scroll-mt-32">
                <AnimatePresence mode="wait">
                    {isSuccess && manuscript && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.98, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -40 }}
                            className="space-y-16"
                        >
                            <div className="p-12 sm:p-20 bg-card border border-primary/5 rounded-[4rem] shadow-vip relative overflow-hidden group border-t-8 border-t-secondary/40">
                                <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-secondary/2 to-transparent pointer-events-none" />
                                
                                <section className="mb-16 space-y-10 relative z-10">
                                    <div className="flex flex-wrap items-center justify-between gap-8">
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-secondary text-white border-none text-[10px] 2xl:text-lg font-black tracking-[0.3em] px-6 h-10 rounded-2xl shadow-xl shadow-secondary/20 uppercase">
                                                Status: {manuscript.status.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-xs 2xl:text-xl font-black text-primary/40 tracking-[0.2em] bg-primary/3 px-6 py-2 rounded-2xl border border-primary/5">
                                                NODE ID: {manuscript.paper_id}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground/40 text-[10px] 2xl:text-base font-black tracking-widest uppercase">
                                            <Calendar className="w-4 h-4" /> Received: {new Date(manuscript.submitted_at).getFullYear()}
                                        </div>
                                    </div>

                                    <h2 className="font-serif font-black text-2xl sm:text-4xl 2xl:text-6xl text-foreground leading-[1.1] tracking-tight uppercase max-w-4xl border-l-12 border-secondary/20 pl-10 py-2">
                                        {manuscript.title}
                                    </h2>

                                    <div className="flex items-center gap-6 text-foreground font-black tracking-[0.2em] text-xs 2xl:text-2xl pt-4">
                                        <div className="w-14 h-14 2xl:w-20 2xl:h-20 rounded-2xl 2xl:rounded-3xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-inner group-hover:scale-110 transition-transform">
                                            <User className="w-6 h-6 2xl:w-10 2xl:h-10 text-secondary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase opacity-40">Corresponding Author</p>
                                            {manuscript.author_name}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-12 pt-16 border-t border-primary/5 max-w-3xl">
                                    <div className="flex items-center gap-4 mb-16">
                                        <div className="h-0.5 w-12 bg-secondary/30" />
                                        <h3 className="text-[10px] 2xl:text-lg font-black text-primary/30 tracking-[0.4em] uppercase m-0 leading-none">
                                            Publication Journey
                                        </h3>
                                    </div>

                                    <div className="space-y-8 pl-4">
                                        <Milestone
                                            title="Manuscript Received"
                                            date={manuscript.submitted_at}
                                            description="Initial version received and queued for mandatory editorial screening and compliance audit."
                                            icon={FileText}
                                            active={isStepActive('submitted')}
                                        />
                                        <Milestone
                                            title="Global Peer Review"
                                            date={manuscript.review_started_at}
                                            description="Assigned to independent domain experts for double-blind peer evaluation and technical verification."
                                            icon={Search}
                                            active={isStepActive('review')}
                                        />
                                        <Milestone
                                            title="Editorial Decision"
                                            date={manuscript.status !== 'under_review' && manuscript.status !== 'submitted' ? manuscript.updated_at : undefined}
                                            description={
                                                manuscript.status === 'accepted' ? "Elite approval granted for publication in the upcoming volume." :
                                                manuscript.status === 'rejected' ? "Manuscript returned Following in-depth scientific evaluation." :
                                                manuscript.status === 'published' ? "Manuscript published and indexed in the global digital archives." :
                                                "Final verification in progress by the Chief Editorial Board."
                                            }
                                            icon={ShieldAlert}
                                            active={isStepActive('decision')}
                                            last
                                        />
                                    </div>
                                </section>

                                {/* Conditional Action Cards */}
                                <div className="mt-16 pt-16 border-t border-primary/5">
                                    {manuscript.status === 'accepted' && (
                                        <motion.section 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-primary p-1.5 rounded-[3.5rem] shadow-3xl relative overflow-hidden group"
                                        >
                                            <div className="bg-slate-950/40 backdrop-blur-3xl p-12 sm:p-16 rounded-[3.4rem] relative z-10">
                                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
                                                                <CreditCard className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="text-white font-serif font-black text-2xl sm:text-3xl tracking-tight uppercase m-0 leading-none">Access <span className="text-secondary">Fees</span> Required</h3>
                                                        </div>
                                                        <p className="text-white/60 font-bold text-sm 2xl:text-2xl leading-relaxed max-w-2xl border-l-4 border-secondary/50 pl-8 ">
                                                            "Your research trajectory has been approved. Please finalize the Article Processing Charge (APC) to proceed with typesetting, indexing, and SJIF impact assessment."
                                                        </p>
                                                    </div>
                                                    <Button asChild className="h-20 2xl:h-28 px-12 2xl:px-20 bg-secondary hover:bg-secondary/90 text-white font-black text-xs 2xl:text-2xl tracking-[0.3em] rounded-3xl 2xl:rounded-[2.5rem] shadow-3xl transition-all shrink-0 cursor-pointer border-t border-white/20 active:scale-95">
                                                        <Link href={`/payment/${manuscript.paper_id}`} className="flex items-center gap-4 cursor-pointer">
                                                            PROCESS PAYMENT <CreditCard className="w-6 h-6 2xl:w-10 2xl:h-10" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.section>
                                    )}

                                    {manuscript.status === 'published' && (
                                        <motion.section 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-emerald-500/5 p-10 sm:p-16 rounded-[3.5rem] border border-emerald-500/20 shadow-inner flex flex-col md:flex-row items-center justify-between gap-10"
                                        >
                                            <div className="space-y-4 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-4">
                                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <h3 className="text-emerald-700 font-serif font-black text-2xl sm:text-3xl tracking-tight uppercase m-0 leading-none">Fully <span className="opacity-40">Indexed</span></h3>
                                                </div>
                                                <p className="text-emerald-600/70 font-bold text-sm 2xl:text-xl tracking-wide max-w-2xl uppercase">
                                                    Your research is now live in the global scientific archives and assigned a unique permanent resource identifier.
                                                </p>
                                            </div>
                                            <Button asChild className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] tracking-widest rounded-2xl shadow-xl transition-all shrink-0 cursor-pointer active:scale-95">
                                                <Link href={`/archive`} className="flex items-center gap-3 cursor-pointer">
                                                    VIEW IN ARCHIVE <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </Button>
                                        </motion.section>
                                    )}

                                    {manuscript.status === 'rejected' && (
                                        <section className="p-12 sm:p-20 bg-destructive/2 border border-destructive/10 rounded-[3.5rem] space-y-10 relative overflow-hidden backdrop-blur-sm">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                            <div className="space-y-4">
                                                <h4 className="text-2xl 2xl:text-4xl font-serif font-black text-destructive tracking-tight uppercase">Editorial Consultation Outcome</h4>
                                                <p className="text-sm 2xl:text-2xl text-muted-foreground font-bold tracking-tight leading-relaxed max-w-3xl">
                                                    The editorial committee has concluded its review. While the current version does not meet publication criteria, we encourage you to review the expert feedback provided below for future scientific refinements.
                                                </p>
                                            </div>
                                            {manuscript.reviewer_feedback && manuscript.reviewer_feedback.length > 0 && (
                                                <div className="grid grid-cols-1 gap-6">
                                                    {manuscript.reviewer_feedback.map((feedback: string, i: number) => (
                                                        <div key={i} className="p-10 bg-card rounded-4xl border border-destructive/10 text-sm 2xl:text-xl text-foreground font-medium leading-[1.8] relative flex gap-6 shadow-sm group hover:border-destructive/30 transition-colors">
                                                            <div className="w-1.5 h-auto bg-destructive/20 rounded-full shrink-0 group-hover:bg-destructive/40 transition-colors" />
                                                            <div className="italic wrap-break-word w-full">"{feedback}"</div>
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
                            <div className="p-16 sm:p-24 bg-card border border-destructive/10 rounded-[4rem] shadow-vip text-center space-y-10 max-w-2xl mx-auto relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-destructive/2 to-transparent pointer-events-none" />
                                <div className="w-20 h-20 2xl:w-32 2xl:h-32 bg-destructive/5 rounded-3xl flex items-center justify-center mx-auto text-destructive border border-destructive/10 shadow-inner group-hover:rotate-12 transition-transform">
                                    <ShieldAlert className="w-10 h-10 2xl:w-16 2xl:h-16" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="font-serif font-black text-3xl 2xl:text-5xl text-foreground tracking-tight uppercase m-0 leading-none">Authentication Failed</h2>
                                    <p className="text-muted-foreground font-bold text-xs 2xl:text-2xl tracking-[0.2em] uppercase m-0 opacity-60">
                                        Access Denied: Manuscript not found or credentials mismatched.
                                    </p>
                                    <p className="text-destructive/60 font-black text-[10px] 2xl:text-base tracking-[0.3em] uppercase">"{errorMessage}"</p>
                                </div>
                                <Button
                                    onClick={() => setSearchTriggered(false)}
                                    className="h-16 2xl:h-24 px-14 2xl:px-20 bg-primary hover:bg-primary/95 text-white font-black text-[10px] 2xl:text-xl tracking-[0.4em] rounded-2xl 2xl:rounded-3xl shadow-3xl transition-all cursor-pointer active:scale-95 border-t border-white/10 uppercase"
                                >
                                    Re-authenticate
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
