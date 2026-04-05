import { memo } from 'react';
import { Download, User, BookOpen, Eye, Globe } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PaperCardProps {
    paper: {
        id: number | string;
        paper_id: string;
        title: string;
        author_name: string;
        author_email?: string;
        affiliation?: string;
        keywords?: string;
        abstract?: string;
        file_path?: string;
        volume_number?: number;
        issue_number?: number;
        publication_year?: number;
        month_range?: string;
    };
    basePath?: string;
}

const PaperCard = memo(function PaperCard({ paper, basePath = '/archives' }: PaperCardProps) {
    return (
        <Card className="border-primary/5 shadow-3xl hover:shadow-vip transition-all duration-700 group overflow-hidden bg-card relative rounded-[3rem] border-t-2 border-t-transparent hover:border-t-secondary/40">
            <div className="absolute inset-0 bg-primary/[0.01] -z-10 group-hover:bg-primary/[0.03] transition-colors" />
            <CardContent className="p-10 md:p-14">
                <div className="flex flex-col gap-10">
                    {/* Header info */}
                    <header className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex flex-wrap items-center gap-4">
                            {(paper as any).status === 'retracted' ? (
                                <Badge className="bg-red-600 text-white border-none text-[10px] 2xl:text-xl font-black tracking-[0.3em] px-6 py-2 rounded-xl shadow-2xl shadow-red-900/20 animate-pulse uppercase">
                                    RETRACTED
                                </Badge>
                            ) : (
                                <Badge className="bg-secondary text-white border-none text-[10px] 2xl:text-xl font-black tracking-[0.3em] px-6 py-2 rounded-xl shadow-xl shadow-secondary/10 uppercase">
                                    Research Manuscript
                                </Badge>
                            )}
                            {paper.volume_number && (
                                <Badge variant="outline" className="text-[10px] 2xl:text-xl font-black tracking-[0.2em] border-primary/5 text-primary/40 bg-primary/5 gap-3 px-6 py-2 rounded-xl uppercase">
                                    <BookOpen className="w-4 h-4 2xl:w-8 2xl:h-8" /> v{paper.volume_number}.i{paper.issue_number} • {paper.publication_year}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] 2xl:text-xl font-black text-primary/20 tracking-[0.4em] uppercase">
                            Registry <span className="bg-primary/5 text-primary/40 px-4 py-2 rounded-xl border border-primary/5 font-mono group-hover:text-secondary group-hover:border-secondary/20 transition-all">{paper.paper_id}</span>
                        </div>
                    </header>

                    <div className="space-y-6">
                        <Link href={`${basePath}/${paper.id}`}>
                            <h3 className="font-serif font-black text-foreground tracking-tight hover:text-secondary hover:translate-x-2 transition-all duration-500 cursor-pointer m-0 leading-[1.1] text-3xl xl:text-4xl 2xl:text-7xl lowercase">
                                {paper.title}
                            </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-10 2xl:gap-20 pt-4">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 2xl:w-24 2xl:h-24 rounded-2xl 2xl:rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/5 text-secondary shadow-inner group-hover:scale-110 transition-transform duration-500" aria-label="Lead Author Icon">
                                    <User className="w-6 h-6 2xl:w-12 2xl:h-12" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] 2xl:text-xl font-black text-primary/30 tracking-[0.4em] m-0 uppercase leading-none">Lead Principal</p>
                                    <p className="font-black text-primary text-base 2xl:text-4xl m-0 tracking-tight">{paper.author_name}</p>
                                </div>
                            </div>

                            {paper.affiliation && (
                                <div className="hidden sm:flex items-center gap-5 border-l border-primary/5 pl-10 2xl:pl-20">
                                    <div className="w-14 h-14 2xl:w-24 2xl:h-24 rounded-2xl 2xl:rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/5 text-primary/20 shadow-inner" aria-label="Affiliation Icon">
                                        <Globe className="w-6 h-6 2xl:w-12 2xl:h-12" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] 2xl:text-xl font-black text-primary/30 tracking-[0.4em] m-0 uppercase leading-none">Institution</p>
                                        <p className="text-primary/60 font-bold text-sm 2xl:text-3xl truncate max-w-xs xl:max-w-xl m-0 tracking-tight uppercase opacity-60">{paper.affiliation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions - High Contrast */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-primary/5">
                        <Button asChild className="h-16 2xl:h-24 px-10 2xl:px-20 bg-primary text-white font-black text-[10px] 2xl:text-2xl tracking-[0.3em] shadow-2xl shadow-primary/20 rounded-2xl 2xl:rounded-[2.5rem] hover:scale-[1.03] transition-all w-full sm:w-auto uppercase">
                            <Link href={`${basePath}/${paper.id}`} className="flex items-center gap-4">
                                <Eye className="w-5 h-5 2xl:w-10 2xl:h-10" /> Inspect Details
                            </Link>
                        </Button>

                        {paper.file_path && (
                            <Button asChild variant="outline" className="h-16 2xl:h-24 px-10 2xl:px-20 font-black text-[10px] 2xl:text-2xl tracking-[0.3em] border-primary/10 text-primary hover:bg-secondary hover:text-white hover:border-secondary rounded-2xl 2xl:rounded-[2.5rem] transition-all w-full sm:w-auto uppercase group/dl">
                                <a href={paper.file_path} download className="flex items-center gap-4">
                                    <Download className="w-5 h-5 2xl:w-10 2xl:h-10 group-hover/dl:animate-bounce" /> Get Tech Report
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export default PaperCard;
