'use client';

import { ShieldCheck, Clock, ChevronRight, Search, Gavel, Users } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";

interface PeerReviewClientProps {
    settings: Record<string, string>;
}

export default function PeerReviewClient({ settings }: PeerReviewClientProps) {
    const journalShortName = settings.journal_short_name || "IJITEST";

    const stages = [
        {
            title: "Preliminary Screening",
            desc: "The editorial board performs an initial triage to verify scope alignment, formatting compliance, and plagiarism benchmarks. Manuscripts that fail this stage are returned immediately.",
            icon: Search
        },
        {
            title: "Double-Blind Evaluation",
            desc: "The manuscript is assigned to at least two independent global domain experts. To ensure technical objectivity, both author and reviewer identities remain fully anonymous.",
            icon: Users
        },
        {
            title: "Final Adjudication",
            desc: "The Editor-in-Chief synthesizes expert feedback to issue a final decision: Accepted, Minor/Major Revision required, or Rejected.",
            icon: Gavel
        }
    ];

    return (
        <section className="container-responsive py-12 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-20">
                    {/* Hero Statement */}
                    <section className="bg-[#000066] p-8 sm:p-12 rounded-xl text-white relative overflow-hidden shadow-sm">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                                <ShieldCheck className="w-8 h-8 text-secondary" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-xl font-semibold m-0 text-white">Scientific Integrity</h2>
                                <p className="text-white/60 text-sm leading-relaxed border-l-2 border-secondary/50 pl-6">
                                    Every manuscript submitted to {journalShortName} undergoes a rigorous double-blind peer review process to ensure technical accuracy and originality.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Review Pipeline */}
                    <section className="space-y-10">
                        <h2 className="text-xl xl:text-2xl font-semibold text-primary m-0">
                            Review Pipeline
                        </h2>

                        <div className="space-y-6">
                            {stages.map((stage, idx) => (
                                <article key={idx} className="group relative flex gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 transition-colors">
                                            <stage.icon className="w-5 h-5" />
                                        </div>
                                        {idx !== stages.length - 1 && <div className="w-[1px] h-full bg-border/50 my-2" />}
                                    </div>
                                    <div className="pb-6">
                                        <h3 className="text-base font-semibold text-primary mb-1">
                                            {stage.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                                            {stage.desc}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Velocity Highlight */}
                    <section className="p-8 sm:p-10 bg-card border border-border/50 rounded-xl shadow-sm border-l-4 border-l-secondary">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-14 h-14 bg-secondary/5 rounded-xl flex items-center justify-center shrink-0 border border-secondary/10">
                                <Clock className="w-7 h-7 text-secondary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-primary m-0">Rapid Verdict</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed m-0 italic">
                                    "{journalShortName} target first-round decisions within 2-3 days of submission."
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-10">
                    <div className="bg-muted/20 p-2 rounded-2xl border border-border/50">
                        <TrackManuscriptWidget />
                    </div>

                    <section className="space-y-6">
                        <div className="p-8 bg-card border border-border/50 rounded-xl shadow-sm border-l-4 border-l-primary/10 transition-all hover:border-l-secondary">
                            <h3 className="text-lg font-semibold text-primary mb-3">COPE Standards</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                                Adherence to the Committee on Publication Ethics (COPE) guidelines for transparency and scientific rigor.
                            </p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-wider text-secondary hover:text-primary transition-colors uppercase">
                                View Policy <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </section>

                    <section className="p-8 bg-[#000066] rounded-xl shadow-sm relative overflow-hidden text-white">
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-semibold m-0 text-white">For Reviewers</h3>
                            <p className="text-white/60 text-xs leading-relaxed">Interested in joining our global panel? Share your technical profile with our board.</p>
                            <Button asChild className="w-full h-10 bg-white text-primary border-none hover:bg-white/90 font-bold text-[10px] tracking-wider rounded-lg transition-all uppercase">
                                <Link href="/join-us" className="w-full h-full flex items-center justify-center">Submit Profile</Link>
                            </Button>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

