'use client';

import { ChevronRight, Gavel } from 'lucide-react';
import Link from 'next/link';

interface TermsClientProps {
    settings: Record<string, string>;
}

export default function TermsClient({ settings }: TermsClientProps) {
    const journalName = settings.journal_name || "IJITEST";
    const supportEmail = settings.support_email || "editor@ijitest.org";

    const framework = [
        {
            title: "Intellectual Sovereignty",
            content: `All published research assets are disseminated under global open-access protocols. Authors retain significant intellectual rights while granting ${journalName} the mandate for exclusive first publication and permanent archival management.`
        },
        {
            title: "Submission Mandate",
            content: "Authors are strictly obligated to ensure the absolute originality of their contributions. Any form of plagiarism or double-submission constitutes a severe protocol violation and will result in immediate rejection and potential ethical reporting."
        },
        {
            title: "Platform Conduct",
            content: "Interaction with the journal platform must adhere to elite professional standards. Unauthorized attempts to exploit digital assets or compromise system integrity will be met with immediate legal and technical countermeasures."
        }
    ];

    return (
        <section className="container-responsive section-padding">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-20">
                    <section className="space-y-4">
                        <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-serif font-semibold text-primary leading-tight">
                            "The {journalName} legal framework ensures a transparent, ethical, and professional ecosystem for engineering excellence."
                        </h2>
                    </section>

                    <div className="space-y-12">
                        {framework.map((item, idx) => (
                            <section key={idx} className="space-y-4">
                                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-mono">0{idx + 1}.</span>
                                    {item.title}
                                </h2>
                                <div className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-6">
                                    <p className="m-0">{item.content}</p>
                                </div>
                            </section>
                        ))}
                    </div>

                    <Card className="bg-[#000066] p-8 sm:p-12 rounded-2xl text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                                <Gavel className="w-8 h-8 text-primary-foreground/50" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-white">Framework Evolution</h3>
                                <p className="text-sm text-white/70 border-l-2 border-white/10 pl-6 m-0 leading-relaxed">
                                    Felix Academic Publications reserves the right to evolve this legal framework. Continued platform usage implies absolute acceptance of these standards.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-12">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                             <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Legal Nexus</p>
                        </div>
                        <div className="space-y-3">
                            <Link href="/privacy" className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:border-primary/20 transition-all group shadow-sm">
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Privacy Protocol</span>
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
