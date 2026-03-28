'use client';

import { ShieldCheck, Gavel, ChevronRight, FileText, Info, HelpCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import SubmissionForm from '@/features/submissions/components/SubmissionForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SubmitClientProps {
    settings: Record<string, string>;
}

export default function SubmitClient({ settings }: SubmitClientProps) {
    const journalShortName = settings.journal_short_name || "IJITEST";

    const requirements = [
        { title: "Formatting", desc: "Manuscripts must follow the IEEE standard format." },
        { title: "Originality", desc: "Submissions must be original and not published elsewhere." },
        { title: "Ethics", desc: "Full adherence to COPE ethical standards is mandatory." },
        { title: "Copyright", desc: "A signed copyright transfer form is required upon acceptance." }
    ];

    return (
        <section className="container-responsive section-padding">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Submission Form */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="bg-white border border-primary/5 rounded-[2.5rem] shadow-sm overflow-hidden relative group border-l-[6px] border-l-primary/10">
                        <div className="bg-primary p-10 xl:p-12 2xl:p-20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="relative z-10 space-y-4">
                                <h2 className="text-white m-0 font-black uppercase tracking-widest">Submit Your Research</h2>
                                <p className="text-white/60 font-medium max-w-xl border-l-2 border-secondary/50 pl-6 m-0 leading-relaxed">
                                    Begin your journey towards global impact. Please fill in the details below to submit your manuscript for peer review.
                                </p>
                            </div>
                        </div>
                        <div className="p-8">
                            <SubmissionForm />
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
                        <h3 className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest text-primary pl-4 border-l-2 border-primary/30 m-0 uppercase">Quick Checklist</h3>
                        <div className="p-8 2xl:p-12 bg-white border border-primary/5 rounded-[2.5rem] shadow-sm border-l-[6px] border-l-secondary/10 hover:border-l-secondary transition-all group">
                            <div className="space-y-8">
                                {requirements.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-6 h-6 2xl:w-10 2xl:h-10 rounded-full bg-secondary/5 border border-secondary/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5 2xl:w-6 2xl:h-6 text-secondary" />
                                        </div>
                                        <div>
                                            <h3 className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest text-primary mb-1 m-0 uppercase">{item.title}</h3>
                                            <p className="text-black/50 m-0 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button asChild className="btn-primary w-full shadow-lg shadow-primary/20 font-black tracking-widest text-xs uppercase">
                                <Link href="/guidelines">View Full Guidelines</Link>
                            </Button>
                        </div>
                    </section>

                    <section className="p-8 2xl:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 ">
                            <div className="w-12 h-12 2xl:w-16 2xl:h-16 bg-white/10 rounded-xl flex items-center justify-center text-primary border border-white/20">
                                <HelpCircle className="w-6 h-6 2xl:w-10 2xl:h-10" />
                            </div>
                            <h3 className="text-primary mb-3 m-0 font-black uppercase tracking-wider">Need Assistance?</h3>
                            <p className="text-black/50 mb-4 m-0 text-sm font-medium leading-relaxed">
                                Encountering technical issues during submission? Our editorial desk is available to assist you 24/7.
                            </p>
                            <Link href="/contact" className="text-xs font-black tracking-widest text-primary hover:text-secondary inline-flex items-center gap-2 m-0 uppercase">
                                Contact Support <ChevronRight className="w-4 h-4 2xl:w-6 2xl:h-6" />
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

