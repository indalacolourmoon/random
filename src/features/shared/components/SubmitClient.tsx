'use client';

import { ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import SubmissionForm from '@/features/submissions/components/SubmissionForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";

interface SubmitClientProps {
    settings: Record<string, string>;
}

const REQUIREMENTS = [
    { title: "Formatting", desc: "Manuscripts must follow the IEEE standard format." },
    { title: "Originality", desc: "Submissions must be original and not published elsewhere." },
    { title: "Ethics", desc: "Full adherence to COPE ethical standards is mandatory." },
    { title: "Copyright", desc: "A signed copyright transfer form is required upon acceptance." }
];

export default function SubmitClient({ settings }: SubmitClientProps) {
    const journalShortName = settings.journal_short_name || "IJITEST";

    return (
        <section className="container-responsive section-padding">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Submission Form */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-[#000066] p-8 sm:p-12 text-white relative overflow-hidden">
                            <div className="relative z-10 space-y-3">
                                <h2 className="text-xl font-semibold m-0 text-white">Submit Research</h2>
                                <p className="text-white/60 text-sm m-0 leading-relaxed border-l-2 border-white/20 pl-6">
                                    Fill in the details below to submit your manuscript for peer review.
                                </p>
                            </div>
                        </div>
                        <div className="p-6 sm:p-10">
                            <SubmissionForm />
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-10">
                    <div className="bg-muted/20 p-2 rounded-2xl border border-border/50">
                        <TrackManuscriptWidget />
                    </div>

                    <section className="space-y-6">
                        <h3 className="text-sm font-semibold text-primary m-0">Quick Checklist</h3>
                        <div className="p-8 bg-card border border-border/50 rounded-xl shadow-sm border-l-4 border-l-secondary/10 transition-all hover:border-l-secondary">
                            <div className="space-y-6 mb-10">
                                {REQUIREMENTS.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-5 h-5 rounded-lg bg-secondary/5 border border-secondary/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-primary mb-1 m-0">{item.title}</h3>
                                            <p className="text-muted-foreground m-0 text-xs leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button asChild className="w-full h-10 bg-[#000066] hover:bg-[#000088] text-white font-bold text-[10px] tracking-wider rounded-lg shadow-sm transition-all uppercase">
                                <Link href="/guidelines">View Guidelines</Link>
                            </Button>
                        </div>
                    </section>

                    <section className="p-8 bg-[#000066] rounded-xl shadow-sm relative overflow-hidden text-white">
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/10">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold m-0 text-white">Need Support?</h3>
                            <p className="text-white/60 text-xs font-medium leading-relaxed m-0">
                                Encountering technical issues? Our board is available to assist you.
                            </p>
                            <Link href="/contact" className="text-[10px] font-bold tracking-widest text-white hover:text-secondary inline-flex items-center gap-2 m-0 uppercase transition-colors">
                                Contact Support <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

