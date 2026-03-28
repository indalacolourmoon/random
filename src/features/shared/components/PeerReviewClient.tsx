'use client';

import { ShieldCheck, Clock, ChevronRight, CheckCircle2, Search, FileText, Gavel, Users } from 'lucide-react';
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
                    <section className="bg-primary p-10 sm:p-14 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-20 h-20 bg-white/10 rounded-2x flex items-center justify-center border border-white/20 shrink-0">
                                <ShieldCheck className="w-10 h-10 text-secondary" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="font-black uppercase tracking-widest text-white m-0">Scientific Integrity</h2>
                                <p className="text-white/60 font-medium leading-relaxed border-l-2 border-secondary/50 pl-6">
                                    Every manuscript submitted to {journalShortName} undergoes a rigorous double-blind peer review process to ensure the highest standards of technical accuracy and originality.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Review Pipeline */}
                    <section className="space-y-12">
                        <h2 className="font-black text-primary tracking-wider flex items-baseline gap-4 m-0 uppercase">
                            Review Pipeline
                        </h2>

                        <div className="space-y-8">
                            {stages.map((stage, idx) => (
                                <article key={idx} className="group relative flex gap-8">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <stage.icon className="w-5 h-5" />
                                        </div>
                                        {idx !== stages.length - 1 && <div className="w-0.5 h-full bg-primary/5 my-2" />}
                                    </div>
                                    <div className="pb-8">
                                        <h3 className="font-black text-primary tracking-wider mb-2 group-hover:text-secondary transition-colors underline-offset-8 decoration-secondary/30 group-hover:underline uppercase underline decoration-2">
                                            {stage.title}
                                        </h3>
                                        <p className="text-primary/70 font-medium leading-relaxed max-w-2xl">
                                            {stage.desc}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Velocity Highlight */}
                    <section className="p-8 sm:p-12 bg-white border border-primary/5 rounded-[2.5rem] shadow-sm border-l-[6px] border-l-secondary">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-16 h-16 bg-secondary/5 rounded-2xl flex items-center justify-center shrink-0 border border-secondary/10">
                                <Clock className="w-8 h-8 text-secondary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-black text-primary tracking-widest uppercase m-0">Rapid Verdict</h3>
                                <p className="text-primary/60 font-medium ">
                                    "We recognize the value of time in research. {journalShortName} provides the first peer-review decision within 2-3 days of submission."
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-12">
                    <div className="group/widget transition-transform duration-500 hover:-translate-y-1">
                        <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.3rem]">
                            <TrackManuscriptWidget />
                        </div>
                    </div>

                    <section className="space-y-6">
                        <div className="p-8 bg-white border border-primary/5 rounded-[2.5rem] shadow-sm border-l-[6px] border-l-primary/10 hover:border-l-secondary transition-all group">

                            <h3 className="font-black text-primary tracking-wider mb-4 uppercase">COPE Standards</h3>
                            <p className="text-sm text-primary/60 leading-relaxed font-medium mb-8">
                                Adherence to the Committee on Publication Ethics (COPE) guidelines for transparency and scientific rigor.
                            </p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-secondary hover:text-primary transition-colors uppercase">
                                View Full Policy <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>

                    <section className="p-8  rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-primary text-xl font-black tracking-wider ">For Reviewers</h3>
                            <p className="text-primary/50 text-xs font-medium leading-relaxed">Interested in joining our global panel of peer reviewers? Share your academic profile with us.</p>
                            <Button asChild className="w-full h-12 bg-white text-primary border border-primary/10 hover:bg-primary hover:text-white font-black text-base tracking-widest rounded-xl transition-all uppercase">
                                <Link href="/join-us">Submit CV</Link>
                            </Button>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

