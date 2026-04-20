'use client'

import { BookOpen, Target, Building2, FlaskConical, Cpu, Globe, Sparkles } from 'lucide-react';

interface AboutClientProps {
    settings: Record<string, string>;
}

export default function AboutClient({ settings }: AboutClientProps) {
    const journalName = settings.journal_name || "International Journal of Innovative Trends in Engineering Science and Technology";
    const journalShortName = settings.journal_short_name || "IJITEST";
    const publisherName = settings.publisher_name || "Felix Academic Publications";

    return (
        <div className="lg:col-span-2 space-y-12 sm:space-y-16">
            {/* Journal Overview */}
            <section className="relative group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/5 rounded-xl text-primary border border-border/50 transition-all">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-primary">Journal Overview</h2>
                </div>
                <div className="text-sm text-muted-foreground space-y-4 border-l-2 border-border pl-6">
                    <p>
                        {journalName} ({journalShortName}) is an international, peer-reviewed journal that publishes original research articles, review papers, and survey articles in Engineering, Science, Technology, and Management.
                    </p>
                    <p>
                        {journalShortName} is dedicated to the dissemination of high-quality research, covering fundamental and applied research, interdisciplinary studies, and emerging technologies that contribute to academic knowledge and industrial growth.
                    </p>
                </div>
            </section>

            {/* Aims Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/5 rounded-xl text-primary border border-border/50">
                        <Target className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-primary m-0">Aim of the Journal</h2>
                </div>
                <div className="p-6 xl:p-8 bg-muted/20 border border-border/50 rounded-xl">
                    <p className="text-sm xl:text-base text-muted-foreground mb-6 leading-relaxed border-l-2 border-primary/30 pl-4">
                        {journalShortName} aims to provide a high-quality international platform for researchers, academicians, industry professionals, and scholars to publish original research in emerging areas of science and technology.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0">
                        {[
                            "Promoting innovative research and technological advancements",
                            "Encouraging interdisciplinary research and collaboration",
                            "Bridging the gap between academia and industry",
                            "Publishing high-quality, peer-reviewed research articles",
                            "Supporting young researchers and scholars globally",
                            "Ensuring technical soundness and research relevance"
                        ].map((commitment, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                                <span className="text-xs text-muted-foreground">{commitment}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Scope Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/5 rounded-xl text-primary border border-border/50">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-primary m-0">Scope of the Journal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        {
                            icon: <Cpu className="w-4 h-4 text-primary" />,
                            title: "Engineering & Technology",
                            items: ["Electronics & Communication", "Computer Science & IT", "AI & Machine Learning", "Data Science & Big Data", "IoT & Embedded Systems", "Quantum Computing", "5G/6G Communication", "Renewable Energy Systems", "Robotics & Automation"]
                        },
                        {
                            icon: <FlaskConical className="w-4 h-4 text-primary" />,
                            title: "Applied Sciences",
                            items: ["Physics & Applied Physics", "Mathematics & Modeling", "Chemistry & Materials", "Environmental Science"]
                        },
                        {
                            icon: <Globe className="w-4 h-4 text-primary" />,
                            title: "Information & Communication Technologies",
                            items: ["Cloud Computing", "Cyber Security", "Blockchain Technology", "Signal & Image Processing", "Wireless Sensor Networks"]
                        },
                        {
                            icon: <Sparkles className="w-4 h-4 text-primary" />,
                            title: "Healthcare",
                            items: ["Biomedical Engineering", "Medical Electronics", "Health Informatics"]
                        },
                        {
                            icon: <Sparkles className="w-4 h-4 text-primary" />,
                            title: "Management",
                            items: ["Operations & Supply Chain", "Business Analytics", "Digital Management"]
                        }
                    ].map((category, idx) => (
                        <article
                            key={idx}
                            className="p-6 bg-card rounded-xl border border-border/50 hover:border-primary/20 transition-all"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-primary/5 rounded-lg border border-border/50">
                                    {category.icon}
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">{category.title}</h3>
                            </div>
                            <ul className="space-y-1.5 list-none p-0">
                                {category.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                        <span className="text-xs text-muted-foreground group-hover/item:text-primary transition-colors">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>

            {/* Technical Specifications */}
            <section className="bg-muted/10 p-8 sm:p-10 rounded-2xl border border-border/50 relative overflow-hidden">
                <h2 className="text-lg font-semibold text-primary mb-8 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-primary" /> Technical Details
                </h2>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Commencement", value: "2026" },
                        { label: "Frequency", value: "12 Issues / Year" },
                        { label: "E-ISSN", value: settings.issn_number || "Applied For" },
                        { label: "Format", value: "Online, Open" }
                    ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-card border border-border/50">
                            <dt className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">{item.label}</dt>
                            <dd className="text-sm font-semibold text-foreground">{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* Publisher Info */}
            <section className="bg-[#000066] p-8 sm:p-12 rounded-2xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                            <Building2 className="w-8 h-8 text-primary-foreground/50" />
                        </div>
                        <h2 className="text-lg xl:text-xl font-serif font-semibold text-white">Legacy Publisher</h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{publisherName}</h3>
                            <p className="text-xs text-white/50">Foundation for Innovation & Global Excellence</p>
                        </div>
                        <div className="text-sm text-white/80 space-y-4 max-w-2xl border-l-[3px] border-white/10 pl-8">
                            <p className="text-white/80">
                                {publisherName} is a mission-driven organization dedicated to bridging the gap between theoretical research and industrial application on a global scale.
                            </p>
                            <p className="text-white/80">
                                Support for {journalShortName} ensures a stable, high-impact platform for researchers, backed by professional editorial handling and world-class indexing infrastructure.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
