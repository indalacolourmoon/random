'use client';

import { Scale, FileText, Copyright, ShieldAlert, ChevronRight, Gavel, CheckCircle2 } from 'lucide-react';
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
                    <section className="space-y-6">
                        <h2 className="font-black leading-relaxed text-primary border-l-4 border-secondary/20 pl-8 m-0 tracking-wider uppercase">
                            "The {journalName} legal framework ensures a transparent, ethical, and professional ecosystem for engineering excellence."
                        </h2>
                    </section>

                    <div className="space-y-20">
                        {framework.map((item, idx) => (
                            <section key={idx} className="space-y-8">
                                <h2 className="text-primary m-0 font-black tracking-wider uppercase">
                                    <span className="text-secondary text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest mr-4 uppercase">0{idx + 1}.</span>
                                    {item.title}
                                </h2>
                                <div className="text-justify text-primary/70 space-y-6 font-medium border-l-2 border-secondary/20 pl-8">
                                    <p className="m-0 text-sm sm:text-base leading-relaxed">{item.content}</p>
                                </div>
                            </section>
                        ))}
                    </div>

                    <Card className="bg-slate-900 p-12 sm:p-16 2xl:p-24 rounded-[4rem] text-white relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-20 h-20 2xl:w-32 2xl:h-32 bg-white/10 rounded-[2rem] flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                <Gavel className="w-10 h-10 2xl:w-16 2xl:h-16 text-secondary" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-white m-0 font-black tracking-wider">Framework Evolution</h2>
                                <p className="text-white/60 font-medium border-l-2 border-secondary/50 pl-6 m-0 leading-relaxed text-sm sm:text-base">
                                    Felix Academic Publications reserves the right to evolve this legal framework. Continued platform usage implies absolute acceptance of these standards.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-12">
                    <section className="space-y-6 text-center lg:text-left">
                        <h3 className="text-xs font-black tracking-widest text-primary/40 pl-4 border-l border-primary/10 mx-auto lg:mx-0 w-fit m-0 uppercase">Legal Nexus</h3>
                        <div className="space-y-4">
                            <Link href="/privacy" className="flex items-center justify-between p-6 2xl:p-10 bg-white border border-primary/5 rounded-2xl hover:border-secondary/20 transition-all group shadow-sm">
                                <span className="text-xs font-black tracking-widest uppercase text-primary/50 group-hover:text-primary m-0">Privacy Protocol</span>
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
