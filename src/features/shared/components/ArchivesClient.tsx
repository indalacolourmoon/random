'use client'

import { FileText, ChevronRight, Search, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import PaperCard from '@/features/archives/components/PaperCard';
import { Button } from "@/components/ui/button";
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { useLatestIssuePapers, useArchivePapers } from '@/hooks/queries/usePublic';
import { InputGroup,InputGroupAddon,InputGroupInput } from '@/components/ui/input-group';
import { Card } from '@/components/ui/card';

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
        <section className=" px-5 mx-auto section-padding">
            {/* Search Section */}
            <div className="mb-8">
                <div className="max-w-4xl mx-auto">
                    <InputGroup className="h-12 xl:h-14 rounded-xl border-border bg-card shadow-sm">
                        <InputGroupAddon align="inline-start" className="pl-4">
                            <Search className="w-5 h-5 text-muted-foreground/50" />
                        </InputGroupAddon>
                        <InputGroupInput 
                            placeholder="Find by Title, Author, or Keywords..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-sm xl:text-base placeholder:text-muted-foreground/30 border-none bg-transparent"
                        />
                    </InputGroup>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-12">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-20 xl:space-y-32">
                    {/* Volume and Issue Header */}
                    {!isLoading && filteredPapers.length > 0 && (
                        <div className="mb-8 border-b border-border/50 pb-4">
                            <h2 className="text-xl font-semibold text-[#000066]">
                                Volume {filteredPapers[0].volume_number} Issue {filteredPapers[0].issue_number} ({filteredPapers[0].publication_year})
                            </h2>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs text-muted-foreground font-medium">Fetching Archives...</p>
                        </div>
                    ) : filteredPapers.length > 0 ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                {filteredPapers.map((paper: any) => (
                                    <PaperCard key={paper.paper_id} paper={paper} basePath={mode === 'current' ? '/current-issue' : '/archives'} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card className="border-dashed border-2 py-16 xl:py-24 text-center rounded-2xl border-border bg-muted/20">
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto text-muted-foreground/30">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl xl:text-2xl font-serif font-semibold text-foreground">Archive In Progress</h2>
                                    <p className="text-sm text-muted-foreground px-12 leading-relaxed">
                                        Our global research portfolio for the current volume is undergoing rigorous archival validation and peer-review synchronization.
                                    </p>
                                </div>
                                <Button asChild className="h-10 px-8 bg-[#000066] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider">
                                    <Link href="/submit" className="flex items-center gap-2">
                                        Submit <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    <Card className="p-1 border-border/50 bg-muted/20 rounded-2xl">
                        <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50">
                            <TrackManuscriptWidget />
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pl-3 border-l-2 border-[#000066]">
                             <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Information</p>
                        </div>
                        <Card className="p-6 border-border/50 bg-card rounded-xl">
                            <div className="w-10 h-10 bg-[#000066]/5 rounded-lg flex items-center justify-center mb-4 text-[#000066]">
                                <Info className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Preservation</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                All research is preserved with DOI assignment and long-term digital storage.
                            </p>
                        </Card>
                    </div>
                </aside>
            </div>
        </section>
    );
}
