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
            <h2 className="text-xl font-semibold text-primary flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">01.</span>
                Institutional Roadmap
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmapItems.map((item, idx) => (
                    <div
                        key={idx}
                        className="p-6 bg-card border border-border/50 rounded-xl hover:border-primary/20 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                            <span className="font-semibold text-base text-primary">{item.name}</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Status</p>
                            <p className="text-xs font-semibold text-primary/80 m-0">{item.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default memo(RoadmapSection);
