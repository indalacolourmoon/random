'use client';

import { ShieldCheck, BookOpen, ChevronRight, ShieldAlert, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';

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
                    <section className="space-y-4">
                        <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-serif font-semibold text-primary leading-tight">
                            "Peer reviewers are fundamental to scientific discourse, ensuring the rigorous validation and ethical integrity of published research."
                        </h2>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-xl font-semibold text-primary flex items-center gap-3">
                            <span className="text-xs text-muted-foreground font-mono">01.</span>
                            Evaluation Directives
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {directives.map((item, i) => (
                                <Card key={i} className="p-6 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all">
                                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mb-4 text-primary">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-primary mb-2">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <Card className="p-8 border-border/50 bg-muted/20 rounded-xl">
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center text-left">
                            <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 border border-primary/10">
                                <ShieldAlert className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-primary">Confidentiality Protocol</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-6">
                                    "Reviewers must treat all manuscript assets as privileged intellectual property. Unauthorized dissemination or use of unpublished data is strictly prohibited."
                                </p>
                            </div>
                        </div>
                    </Card>

                    <section className="bg-[#000066] text-white p-10 rounded-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-white">Join Our Reviewer Network</h3>
                                    <p className="text-white/60 text-sm max-w-xl">
                                        Contribute your expertise to {journalShortName} and help maintain the standards of engineering research.
                                    </p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                                    <BookOpen className="w-10 h-10 text-white/50" />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <Button asChild size="lg" className="h-12 px-8 bg-white text-primary hover:bg-white/90 text-[10px] font-bold tracking-wider rounded-xl transition-all flex-1 sm:flex-none uppercase">
                                    <a href={`mailto:${supportEmail}`}><Mail className="w-4 h-4 mr-2" /> {supportEmail}</a>
                                </Button>
                                <Button asChild size="lg" className="h-12 px-8 bg-white/10 text-white hover:bg-white/20 text-[10px] font-bold tracking-wider rounded-xl transition-all border border-white/10 flex-1 sm:flex-none uppercase">
                                    <a href={`https://wa.me/${supportPhone.replace(/[\s+]/g, '')}`} className="flex items-center"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Support</a>
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

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                             <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Compliance Guide</p>
                        </div>
                        <Card className="p-6 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all">
                            <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mb-4 text-primary">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-primary mb-2">Ethics Matrix</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                                All reviewers are expected to follow COPE guidelines for ethical evaluation and disclosure.
                            </p>
                            <Button asChild variant="link" className="text-primary p-0 h-auto hover:text-primary/80 transition-colors text-xs font-semibold">
                                <Link href="/ethics" className="flex items-center">
                                    View Full Policy <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                                </Link>
                            </Button>
                        </Card>
                    </section>
                </aside>
            </div>
        </section>
    );
}

