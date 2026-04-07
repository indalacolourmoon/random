'use client';

import { ShieldCheck, BookOpen, ChevronRight, ShieldAlert, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";

interface ReviewerGuidelinesClientProps {
    settings: Record<string, string>;
}

export default function ReviewerGuidelinesClient({ settings }: ReviewerGuidelinesClientProps) {
    const supportEmail = settings.support_email || "editor@iitest.org";
    const supportPhone = settings.support_phone || "+91 8919643590";
    const journalShortName = settings.journal_short_name || "IJITEST";

    const directives = [
        { title: "Originality", desc: "Evaluate the significant empirical novelty or conceptual innovation presented in the manuscript." },
        { title: "Methodology", desc: "Assess the rigor of experimental design and the validity of analytical protocols." },
        { title: "Clarity", desc: "Ensure concise language and precise data visualization for effective communication." },
        { title: "Impact", desc: "Determine the potential contribution to the global scientific community." }
    ];

    return (
        <section className="container-responsive py-12 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-20">
                    <section className="space-y-6">
                        <h2 className="font-black leading-relaxed text-primary tracking-wider border-l-4 border-secondary/20 pl-8 m-0 uppercase">
                            "Peer reviewers are fundamental to scientific discourse, ensuring the rigorous validation and ethical integrity of published research."
                        </h2>
                    </section>

                    <section className="space-y-12">
                        <h2 className="font-black text-primary tracking-wider flex items-baseline gap-4 m-0 uppercase">
                            <span className="text-secondary text-sm font-serif ">01.</span>
                            Evaluation Directives
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {directives.map((item, i) => (
                                <article key={i} className="p-8 bg-primary/5 border border-primary/10 rounded-3xl shadow-sm transition-all border-l-[6px] border-l-primary/10 hover:border-l-secondary">
                                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <h3 className=" font-black tracking-widest text-primary mb-3 uppercase m-0 text-[10px] sm:text-[11px] ">{item.title}</h3>
                                    <h3 className="text-primary mb-3 m-0 text-[10px] sm:text-[11px] ">{item.title}</h3>
                                    <p className="text-sm font-medium text-primary/60 leading-relaxed ">{item.desc}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="bg-primary/5 border border-primary/10 rounded-3xl shadow-sm p-10 text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-20 h-20 bg-primary/5 rounded-4xl flex items-center justify-center shrink-0 border border-primary/10 shadow-inner">
                                <ShieldAlert className="w-10 h-10 text-secondary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-black text-white tracking-widest uppercase m-0">Confidentiality Protocol</h3>
                                <p className="text-white/60 font-medium leading-relaxed border-l-2 border-secondary/50 pl-6">
                                    "Reviewers must treat all manuscript assets as privileged intellectual property. Unauthorized dissemination or use of unpublished data is strictly prohibited."
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900 text-white p-12 sm:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 space-y-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                <div className="space-y-4">
                                    <h3 className="font-black tracking-widest uppercase m-0">Join Our Reviewer Network</h3>
                                    <p className="text-white/50 font-medium max-w-xl ">
                                        Contribute your expertise to {journalShortName} and help maintain the standards of engineering research.
                                    </p>
                                </div>
                                <div className="bg-white/10 p-6 rounded-3xl border border-white/10 shrink-0">
                                    <BookOpen className="w-12 h-12 text-secondary" />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-6 w-full">
                                <Button asChild size="lg" className="h-14 px-10 bg-white text-primary hover:bg-white/90 text-xs tracking-widest rounded-2xl shadow-xl transition-all flex-1 sm:flex-none uppercase font-black">
                                    <a href={`mailto:${supportEmail}`}><Mail className="w-5 h-5 mr-3" /> {supportEmail}</a>
                                </Button>
                                <Button asChild size="lg" className="h-14 px-10 bg-secondary text-white hover:bg-secondary/90 text-xs tracking-widest rounded-2xl shadow-xl transition-all flex-1 sm:flex-none uppercase font-black">
                                    <a href={`https://wa.me/${supportPhone.replace(/[\s+]/g, '')}`} className="flex items-center"><MessageCircle className="w-5 h-5 mr-3" /> WhatsApp Support</a>
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <aside className="space-y-12">
                    <div className="group/widget transition-transform duration-500 hover:-translate-y-1">
                        <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.3rem]">
                            <TrackManuscriptWidget />
                        </div>
                    </div>

                    <section className="space-y-6">
                        <h3 className="text-[10px] sm:text-[11px] font-black tracking-[0.3em] text-primary/40 pl-4 border-l border-primary/10 m-0 uppercase">Compliance Guide</h3>
                        <div className="p-8 bg-primary/5 border border-primary/10 rounded-3xl shadow-sm transition-all border-l-[6px] border-l-primary/10 hover:border-l-secondary">
                            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-secondary group-hover:text-white transition-colors">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className=" font-black text-primary tracking-wider mb-2 ">Ethics Matrix</h3>
                            <p className="text-sm text-primary/60 leading-relaxed font-medium mb-8 ">
                                All reviewers are expected to follow COPE guidelines for ethical evaluation and disclosure.
                            </p>
                            <Button asChild variant="link" className="text-secondary p-0 font-black tracking-widest text-xs h-auto hover:text-primary transition-colors uppercase">
                                <Link href="/ethics" className="flex items-center">
                                    View Full Policy <ChevronRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

