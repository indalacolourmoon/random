'use client';

import ReviewerApplicationForm from "@/features/reviewer/components/ReviewerApplicationForm";
import { CheckCircle2, Globe, Users, Award, ShieldCheck } from 'lucide-react';

interface JoinUsClientProps {
    settings: Record<string, string>;
}

export default function JoinUsClient({ settings }: JoinUsClientProps) {
    const journalShortName = settings.journal_short_name || "IJITEST";

    const benefits = [
        {
            icon: Globe,
            title: "Global Recognition",
            desc: "Featured in our archives as a pillar of scientific integrity and scholarly quality."
        },
        {
            icon: Users,
            title: "Academic Networking",
            desc: "Direct synergy with world-class editors and researchers at the frontier of technology."
        },
        {
            icon: Award,
            title: "Certification",
            desc: "Official certifications and recognition for your contributions to peer-review excellence."
        }
    ];

    const requirements = [
        "Ph.D. Doctorate in Engineering or related Technical Field",
        "Active research background with recent publications",
        "Verified publication history (minimum 5 peer-reviewed papers)",
        "Affiliation with a recognized academic or research institution"
    ];

    return (
        <section className="container-responsive py-12 sm:py-24" aria-labelledby="join-us-heading">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left Column: Benefits & Requirements */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-16">
                    <header className="space-y-6">
                        <h2 id="join-us-heading" className="text-primary font-black uppercase tracking-widest">
                            Contribute to Scholarly Excellence
                        </h2>
                        <p className="text-primary/70 leading-relaxed font-medium text-base sm:text-lg border-l-4 border-secondary/20 pl-6 ">
                             "Joining the {journalShortName} Peer Reviewer database is a commitment to precision and integrity, helping shape the trajectory of global engineering research."
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-6" role="list" aria-label="Benefits of joining">
                        {benefits.map((benefit, i) => (
                            <article key={i} role="listitem" className="p-6 sm:p-8 bg-white border border-primary/5 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 border-l-[6px] border-l-primary/10 hover:border-l-secondary group">
                                <div className="flex gap-6 items-center">
                                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-colors" aria-hidden="true">
                                        <benefit.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-primary tracking-wider mb-1 font-black uppercase">{benefit.title}</h3>
                                        <p className="text-xs text-black font-medium leading-relaxed">{benefit.desc}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <section className=" p-8 sm:p-14 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl" aria-labelledby="eligibility-heading">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 space-y-8">
                            <h3 id="eligibility-heading" className="tracking-wider text-primary font-black uppercase">Eligibility Standards</h3>
                            <ul className="space-y-4">
                                {requirements.map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black uppercase tracking-widest ">
                                        <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center shrink-0" aria-hidden="true">
                                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                                        </div>
                                        <span className="text-black">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <aside className="p-8 bg-white border border-primary/5 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                        <div className="w-12 h-12 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary shrink-0" aria-hidden="true">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-medium text-primary/60 leading-relaxed uppercase tracking-widest">
                            {journalShortName} adheres to COPE guidelines. All applications are reviewed by the Editor-in-Chief for technical and ethical alignment.
                        </p>
                    </aside>
                </div>

                {/* Right Column: Application Form */}
                <div className="lg:col-span-12 xl:col-span-7">
                    <div className="p-1 sm:p-2 bg-linear-to-br from-primary/10 to-transparent rounded-[3rem] shadow-2xl">
                        <div className="bg-white p-2 sm:p-5 lg:p-12 rounded-[2.9rem]">
                            <ReviewerApplicationForm />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
