'use client';

import { Search, Database, ChevronRight, Globe, Layers, BarChart3, Binary } from 'lucide-react';
import RoadmapSection from '@/features/indexing/components/RoadmapSection';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";
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
                    <section className="bg-primary p-10 sm:p-14 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                                <Search className="w-10 h-10 text-secondary" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="font-black uppercase tracking-widest text-white m-0">Global Visibility</h2>
                                <p className="text-white/60 font-medium leading-relaxed border-l-2 border-secondary/50 pl-6 m-0">
                                    "Our strategic mandate is to ensure that every validated innovation published in {journalShortName} reaches the global scientific community through premier indexing hubs."
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Integrated Roadmap */}
                    <RoadmapSection />

                    {/* Technical Standards */}
                    <section className="space-y-12">
                        <h2 className="font-black text-primary tracking-wider flex items-baseline gap-4 m-0 uppercase">
                            <span className="text-secondary text-xs sm:text-sm lg:text-lg font-serif tracking-widest">02.</span>
                            Technical Protocols
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {techSpecs.map((spec, idx) => (
                                <div key={idx} className="p-8 bg-white border border-primary/5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border-l-[6px] border-l-primary/10 hover:border-l-secondary">
                                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6 transition-colors">
                                        <spec.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className=" font-black text-primary tracking-wider mb-2 ">{spec.title}</h3>
                                    <p className="text-sm text-primary/60 font-medium leading-relaxed">
                                        {spec.desc}
                                    </p>
                                </div>
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

                    <section className="space-y-6">
                        <h3 className=" font-black tracking-widest text-primary/40 pl-4 border-l border-primary/10 uppercase">Strategic Integration</h3>
                        <div className="p-8 bg-white border border-primary/5 rounded-[2.5rem] shadow-sm border-l-[6px] border-l-primary/10 hover:border-l-secondary transition-all group">
                            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-secondary group-hover:text-white transition-colors">
                                <Database className="w-6 h-6" />
                            </div>
                             <h3 className="font-black text-primary tracking-wider mb-4 uppercase">Inaugural 2026</h3>
                            <p className="text-sm text-primary/60 leading-relaxed font-medium mb-8">
                                Submissions for our 2026 volume are now open. All accepted papers receive priority metadata assignment and SJIF evaluation.
                            </p>
                            <Button asChild className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-black text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 uppercase">
                                <Link href="/submit">Submit Paper</Link>
                            </Button>
                        </div>
                    </section>

                    <section className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[50px] pointer-events-none" />
                        <div className="relative z-10 space-y-6">
                            <h3 className=" font-black tracking-wider text-white ">Policy Matrix</h3>
                            <p className="text-white/50 text-xs font-medium leading-relaxed">Our indexing adheres strictly to the Committee on Publication Ethics (COPE) benchmarks.</p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-secondary hover:text-white transition-colors uppercase">
                                View Ethics Guide <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

