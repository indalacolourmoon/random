'use client'

import { FileText, ChevronRight, Search, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import PaperCard from '@/features/archives/components/PaperCard';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { useLatestIssuePapers, useArchivePapers } from '@/hooks/queries/usePublic';

interface ArchivesClientProps {
    initialPapers: any[];
    settings: Record<string, string>;
    mode?: 'current' | 'archive';
}

export default function ArchivesClient({ initialPapers, settings, mode = 'archive' }: ArchivesClientProps) {
    const currentIssueQuery = useLatestIssuePapers(mode === 'current' ? initialPapers : []);
    const archiveQuery = useArchivePapers(mode === 'archive' ? initialPapers : []);
    
    const papers = (mode === 'current' ? currentIssueQuery.data : archiveQuery.data) || [];
    const isLoading = mode === 'current' ? currentIssueQuery.isLoading : archiveQuery.isLoading;

    const [searchQuery, setSearchQuery] = useState('');
    const journalShortName = settings.journal_short_name || "IJITEST";

    const filteredPapers = useMemo(() => {
        return (papers || []).filter((p: any) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.keywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.paper_id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [papers, searchQuery]);

    return (
        <section className="container-responsive section-padding max-w-7xl 2xl:max-w-[1700px] mx-auto">
            {/* Search Section - Higher Fidelity */}
            <div className="mb-20 xl:mb-32">
                <div className="relative group max-w-4xl mx-auto">
                    <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl group-focus-within:bg-secondary/10 transition-colors -z-10" />
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/20 z-10 transition-colors group-focus-within:text-secondary group-hover:text-primary/40">
                        <Search className="w-8 h-8 2xl:w-12 2xl:h-12" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Scan Archives: Title, Research Domain, or PI..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-20 2xl:h-32 pl-20 2xl:pl-28 pr-12 rounded-[2.5rem] bg-card border-primary/5 shadow-3xl focus-visible:ring-secondary/20 placeholder:text-primary/20 font-black text-lg 2xl:text-3xl tracking-tight transition-all w-full glassmorphism uppercase"
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
                        <Badge className="bg-primary/5 text-primary/40 border-none px-3 py-1 h-auto text-[9px] 2xl:text-lg font-black tracking-widest uppercase">Global Schema v4</Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-20 xl:space-y-32">
                    {isLoading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-6">
                            <div className="w-16 h-16 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-black text-primary/40 tracking-[0.4em] uppercase animate-pulse">Syncing Archive Nodes...</p>
                        </div>
                    ) : filteredPapers.length > 0 ? (
                        <div className="space-y-16">
                            <div className="flex items-end justify-between border-b border-primary/5 pb-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] 2xl:text-xl font-black text-primary/40 tracking-[0.4em] uppercase">Registry Result</p>
                                    <h2 className="m-0 font-serif font-black text-foreground tracking-tighter text-4xl 2xl:text-6xl lowercase">
                                        {filteredPapers.length} <span className="text-primary/50">manuscripts</span>
                                    </h2>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-5 py-2.5 h-auto text-[10px] 2xl:text-2xl font-black tracking-widest uppercase rounded-xl">Verified Archive</Badge>
                            </div>

                            <div className="space-y-12 2xl:space-y-20">
                                {filteredPapers.map((paper: any) => (
                                    <PaperCard key={paper.paper_id} paper={paper} basePath={mode === 'current' ? '/current-issue' : '/archives'} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-20 2xl:p-32 bg-card border border-primary/5 rounded-[4rem] shadow-3xl text-center space-y-12 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-primary/1 -z-10 group-hover:bg-primary/3 transition-colors" />
                            <div className="w-24 h-24 2xl:w-40 2xl:h-40 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto text-primary/10 group-hover:scale-110 transition-transform shadow-inner">
                                <FileText className="w-12 h-12 2xl:w-20 2xl:h-20" />
                            </div>
                            <div className="space-y-6">
                                <h2 className="m-0 font-serif font-black text-foreground tracking-tighter text-4xl 2xl:text-6xl uppercase leading-none">Inaugural Archive <br/><span className="text-primary/30">In Progress</span></h2>
                                <p className="text-primary/50 text-base 2xl:text-3xl font-bold max-w-xl mx-auto leading-relaxed uppercase opacity-60">
                                    Our global research portfolio for the {new Date().getFullYear()} volume is undergoing rigorous archival validation.
                                </p>
                            </div>
                            <Button asChild className="h-16 2xl:h-24 px-12 2xl:px-20 bg-secondary text-white font-black text-[10px] 2xl:text-2xl tracking-[0.4em] shadow-2xl shadow-secondary/20 rounded-2xl 2xl:rounded-[2.5rem] hover:scale-105 transition-all">
                                <Link href="/submit" className="flex items-center gap-4">
                                    Initiate Submission <ChevronRight className="w-5 h-5 2xl:w-10 2xl:h-10" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar - Enhanced Fidelity */}
                <aside className="lg:col-span-4 space-y-16">
                    <div className="group/widget transition-all duration-500 hover:-translate-y-2">
                        <div className="bg-card/50 backdrop-blur-xl p-4 rounded-[3rem] shadow-3xl border border-primary/5 glassmorphism">
                            <TrackManuscriptWidget />
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="flex items-center gap-4 pl-4 border-l-4 border-secondary">
                             <p className="text-[10px] 2xl:text-xl font-black tracking-[0.4em] text-primary/40 m-0 uppercase">Editorial Protocol</p>
                        </div>
                        <article className="p-10 2xl:p-16 bg-card border border-primary/5 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-secondary/20 transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-secondary/10 transition-colors" />
                            <div className="w-14 h-14 2xl:w-24 2xl:h-24 bg-primary/5 rounded-2xl 2xl:rounded-4xl flex items-center justify-center mb-10 text-primary group-hover:bg-secondary group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                                <Info className="w-7 h-7 2xl:w-12 2xl:h-12" />
                            </div>
                            <h3 className="font-serif font-black text-foreground tracking-tight mb-4 text-2xl 2xl:text-4xl uppercase">Digital Permanent <span className="text-secondary opacity-50">Sovereignty</span></h3>
                            <p className="text-primary/50 text-xs 2xl:text-2xl font-bold leading-relaxed uppercase opacity-80">
                                All published research is archived with permanent DOI assignment and long-term digital preservation through global open-access discovery hubs.
                            </p>
                        </article>
                    </div>
                </aside>
            </div>
        </section>
    );
}
