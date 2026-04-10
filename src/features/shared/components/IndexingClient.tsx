'use client';

import { Search, Database, ChevronRight, Globe, Layers, BarChart3, Binary } from 'lucide-react';
import RoadmapSection from '@/features/indexing/components/RoadmapSection';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import Link from 'next/link';
interface IndexingClientProps {
    settings: Record<string, string>;
}

export default function IndexingClient({ settings }: IndexingClientProps) {
    const journalShortName = settings.journal_short_name || "IJITEST";

    const techSpecs = [
        { title: "SJIF Evaluation", desc: "Annual impact factor assessment by SJIF for scientific validation.", icon: BarChart3 },
        { title: "OAI-PMH", desc: "Standard metadata harvesting interface for global repository integration.", icon: Globe },
        { title: "XML Delivery", desc: "Automated indexing feeding systems via high-quality JATS XML.", icon: Binary },
        { title: "Archival Sync", desc: "Long-term preservation orchestration with Amazon S3 and ROAD.", icon: Layers }
    ];

    return (
        <section className="container-responsive py-12 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-20">
                    {/* Vision Statement */}
                    {/* Vision Statement */}
                    <Card className="bg-[#000066] p-8 sm:p-12 rounded-2xl text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                                <Search className="w-8 h-8 text-primary-foreground/50" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">Global Visibility</h2>
                                <p className="text-sm text-white/70 border-l-2 border-white/10 pl-6 m-0 leading-relaxed">
                                    "Our strategic mandate is to ensure that every validated innovation published in {journalShortName} reaches the global scientific community through premier indexing hubs."
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Integrated Roadmap */}
                    <RoadmapSection />

                    {/* Technical Standards */}
                    <section className="space-y-8">
                        <h2 className="text-xl font-semibold text-primary flex items-center gap-3">
                            <span className="text-xs text-muted-foreground font-mono">01.</span>
                            Technical Protocols
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {techSpecs.map((spec, idx) => (
                                <Card key={idx} className="p-6 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all">
                                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary mb-4">
                                        <spec.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-primary mb-2">{spec.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {spec.desc}
                                    </p>
                                </Card>
                            ))}
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
                             <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Strategic Integration</p>
                        </div>
                        <Card className="p-6 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all">
                            <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mb-4 text-primary">
                                <Database className="w-5 h-5" />
                            </div>
                             <h3 className="text-sm font-semibold text-primary mb-2">Inaugural 2026</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                                Submissions for our 2026 volume are now open. All accepted papers receive priority metadata assignment and SJIF evaluation.
                            </p>
                            <Button asChild className="w-full h-10 bg-[#000066] hover:bg-[#000088] text-white font-bold text-[10px] tracking-wider rounded-lg transition-all shadow-sm uppercase">
                                <Link href="/submit">Submit Paper</Link>
                            </Button>
                        </Card>
                    </section>

                    <Card className="p-6 bg-[#000066] rounded-xl text-white relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-sm font-semibold text-white">Policy Matrix</h3>
                            <p className="text-white/60 text-xs leading-relaxed">Our indexing adheres strictly to the Committee on Publication Ethics (COPE) benchmarks.</p>
                            <Link href="/ethics" className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white hover:underline transition-all uppercase">
                                View Ethics Guide <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </Card>
                </aside>
            </div>
        </section>
    );
}

