'use client';

import { Lock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PrivacyClientProps {
    settings: Record<string, string>;
}

export default function PrivacyClient({ settings }: PrivacyClientProps) {
    const journalName = settings.journal_name || "IJITEST";
    const supportEmail = settings.support_email || "editor@ijitest.org";

    const sections = [
        {
            title: "Data Stewardship",
            content: `The ${journalName} and Felix Academic Publications operate as sovereign guardians of scholarly data. We strictly collect essential metadata (Author identity, Institutional affiliation, and Contact credentials) solely to facilitate the rigorous peer-review and publication orchestration.`
        },
        {
            title: "Metadata Circulation",
            content: "Personal data circulation is restricted to the internal editorial workflow. Shared digital assets are limited to certified academic indexing protocols (CrossRef, ORCID, and global repository hubs) to ensure the permanence of your research."
        },
        {
            title: "Fortified Security",
            content: "All manuscript assets and author credentials reside behind multi-layered encryption protocols on audited secure servers. We maintain strictly controlled access to prevent unauthorized dissemination of unpublished intellectual property."
        }
    ];

    return (
        <section className="container-responsive section-padding">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-20">
                    <section className="space-y-6">
                        <h2 className="font-black leading-relaxed text-primary border-l-4 border-secondary/20 pl-8 m-0 tracking-wider uppercase">
                            "Data privacy is a pillar of scientific integrity. We protect your scholarly contributions with advanced security protocols."
                        </h2>
                    </section>

                    <div className="space-y-20">
                        {sections.map((section, idx) => (
                            <section key={idx} className="space-y-8">
                                <h2 className="text-primary m-0 font-black tracking-wider uppercase">
                                    <span className="text-secondary text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest mr-4">0{idx + 1}.</span>
                                    {section.title}
                                </h2>
                                <div className="text-justify text-primary/70 space-y-6 font-medium border-l-2 border-secondary/20 pl-8">
                                    <p className="m-0 text-sm sm:text-base leading-relaxed">{section.content}</p>
                                </div>
                            </section>
                        ))}
                    </div>

                    <Card className="bg-primary p-12 sm:p-16 2xl:p-24 rounded-[4rem] text-white relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-20 h-20 2xl:w-32 2xl:h-32 bg-white/10 rounded-4xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                <Lock className="w-10 h-10 2xl:w-16 2xl:h-16 text-secondary" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-white m-0 font-black tracking-wider">Inquiries</h2>
                                <p className="text-white/60 font-medium border-l-2 border-secondary/50 pl-6 m-0 leading-relaxed text-sm sm:text-base">
                                    For any privacy concerns or data access requests, please synchronize with our verified Privacy Officer at <span className="text-secondary font-black">{supportEmail}</span>.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-12">
                    <section className="space-y-6 text-center lg:text-left">
                        <h3 className=" font-black tracking-widest text-primary/40 pl-4 border-l border-primary/10 mx-auto lg:mx-0 w-fit m-0 uppercase">Nexus Links</h3>
                        <div className="space-y-4">
                            <Link href="/terms" className="flex items-center justify-between p-6 2xl:p-10 bg-white border border-primary/5 rounded-2xl hover:border-secondary/20 transition-all group shadow-sm">
                                <span className="text-xs font-black tracking-widest uppercase text-primary/50 group-hover:text-primary m-0">Terms & Conditions</span>
                                <ChevronRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/ethics" className="flex items-center justify-between p-6 2xl:p-10 bg-white border border-primary/5 rounded-2xl hover:border-secondary/20 transition-all group shadow-sm">
                                <span className="text-xs font-black tracking-widest uppercase text-primary/50 group-hover:text-primary m-0">Publication Ethics</span>
                                <ChevronRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <section className={className}>{children}</section>;
}
