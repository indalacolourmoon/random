'use client'

import { Calendar, FileText, ChevronRight, Download, Search, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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
    
    const papers = mode === 'current' ? currentIssueQuery.data : archiveQuery.data;
    const isLoading = mode === 'current' ? currentIssueQuery.isLoading : archiveQuery.isLoading;

    const [searchQuery, setSearchQuery] = useState('');
    const journalShortName = settings.journal_short_name || "IJITEST";

    const filteredPapers = papers.filter((p: any) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paper_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="container-responsive section-padding">
            {/* Search Section */}
            <div className="mb-16">
                <div className="relative group max-w-3xl mx-auto">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30 z-10 transition-colors group-focus-within:text-primary">
                        <Search className="w-6 h-6" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search archives by Title, Author, or Manuscript ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-16 2xl:h-20 pl-16 pr-8 rounded-3xl bg-white border-secondary shadow-sm focus-visible:ring-orange-700/30 placeholder:text-primary font-medium transition-all w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-16">
                    {isLoading ? (
                        <div className="p-24 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary/10" />
                        </div>
                    ) : filteredPapers.length > 0 ? (
                        <div className="space-y-12">
                            <div className="flex items-center justify-between border-b border-primary/5 pb-8">
                                <h2 className="m-0">
                                    <span className="text-secondary text-base lg:text-lg font-serif mr-4">Total:</span>
                                    {filteredPapers.length} Manuscripts
                                </h2>
                                    <Badge className="bg-primary/5 text-primary border-primary/10 px-4 py-1.5 h-auto text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest uppercase">Live Volume</Badge>
                            </div>

                            <div className="space-y-8">
                                {filteredPapers.map((paper: any) => (
                                    <PaperCard key={paper.paper_id} paper={paper} basePath={mode === 'current' ? '/current-issue' : '/archives'} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 sm:p-24 bg-white border border-primary/5 rounded-[3rem] shadow-sm text-center space-y-10 border-l-[6px] border-l-secondary/10">
                            <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto text-primary/20">
                                <FileText className="w-10 h-10" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="m-0">Inaugural Volume In Progress</h2>
                                <p className="text-primary/50 max-w-md mx-auto font-medium">
                                    Our inaugural 2026 volume is currently undergoing rigorous peer-review. Accepted manuscripts will be listed here following final validation.
                                </p>
                            </div>
                            <Button asChild className="btn-primary">
                                <Link href="/submit" className="flex items-center gap-3">
                                    Submit Your Research <ChevronRight className="w-4 h-4 2xl:w-8 2xl:h-8" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-12">
                    <div className="group/widget transition-transform duration-500 hover:-translate-y-1">
                        <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.3rem]">
                            <TrackManuscriptWidget />
                        </div>
                    </div>

                    <section className="space-y-6">
                        <h3 className="text-[10px] sm:text-[11px] font-black tracking-[0.3em] text-primary/40 pl-4 border-l border-primary/10 m-0 uppercase">Archive Protocols</h3>
                        <article className="p-8 2xl:p-14 bg-white border border-primary/5 rounded-[2.5rem] shadow-sm border-l-[6px] border-l-primary/10 hover:border-l-secondary transition-all group">
                            <div className="w-12 h-12 2xl:w-20 2xl:h-20 bg-primary/5 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-secondary group-hover:text-white transition-colors">
                                <Info className="w-6 h-6 2xl:w-10 2xl:h-10" />
                            </div>
                            <h3 className=" font-black text-primary tracking-wider mb-4 uppercase">Digital Sovereignty</h3>
                            <p className="text-primary/60 font-medium mb-8">
                                All published research is archived with permanent DOI assignment and long-term digital preservation through global discovery hubs.
                            </p>
                        </article>
                    </section>
                </aside>
            </div>
        </section>
    );
}
