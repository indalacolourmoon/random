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
                    <section className="space-y-4">
                        <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-serif font-semibold text-primary leading-tight">
                            "Data privacy is a pillar of scientific integrity. We protect your scholarly contributions with advanced security protocols."
                        </h2>
                    </section>

                    <div className="space-y-20">
                        {sections.map((section, idx) => (
                            <section key={idx} className="space-y-4">
                                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-mono">0{idx + 1}.</span>
                                    {section.title}
                                </h2>
                                <div className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-6">
                                    <p className="m-0">{section.content}</p>
                                </div>
                            </section>
                        ))}
                    </div>

                    <Card className="bg-[#000066] p-8 sm:p-12 rounded-2xl text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                                <Lock className="w-8 h-8 text-primary-foreground/50" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-white">Inquiries</h3>
                                <p className="text-sm text-white/70 border-l-2 border-white/10 pl-6 m-0 leading-relaxed">
                                    For any privacy concerns or data access requests, please contact our verified Privacy Officer at <span className="text-white font-semibold">{supportEmail}</span>.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-12">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                             <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Nexus Links</p>
                        </div>
                        <div className="space-y-3">
                            <Link href="/terms" className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:border-primary/20 transition-all group shadow-sm">
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Terms & Conditions</span>
                                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                            <Link href="/ethics" className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:border-primary/20 transition-all group shadow-sm">
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Publication Ethics</span>
                                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
