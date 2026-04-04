"use client";
import { memo } from 'react';

const roadmapItems = [
    { name: "Google Scholar", status: "Active Processing" },
    { name: "CrossRef", status: "Full Assignment" },
    { name: "ROAD Directory", status: "Verified Entry" },
    { name: "UGC CARE", status: "Upcoming Goal" },
    { name: "Scopus / WOS", status: "Strategic Target" },
    { name: "ResearchGate", status: "Auto-Integration" }
];

function RoadmapSection() {
    return (
        <section className="space-y-12">
            <h2 className=" font-black text-primary tracking-wider flex items-baseline gap-4">
                <span className="text-secondary text-sm font-serif ">01.</span>
                Institutional Roadmap
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmapItems.map((item, idx) => (
                    <article
                        key={idx}
                        className="p-8 bg-white border border-primary/5 rounded-[2rem] shadow-sm group hover:shadow-xl hover:border-secondary/20 transition-all duration-500 border-l-[6px] border-l-primary/10 hover:border-l-secondary"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-2 h-2 bg-secondary rounded-full shrink-0 animate-pulse" />
                            <span className="font-black text-xl text-primary tracking-wider">{item.name}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-black text-primary/30 tracking-widest block uppercase">Status Protocol</span>
                            <span className="text-xs font-black text-secondary tracking-widest uppercase">{item.status}</span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default memo(RoadmapSection);
