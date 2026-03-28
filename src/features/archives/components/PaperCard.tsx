'use client';

import { Download, User, BookOpen, Eye } from 'lucide-react';
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

export default function PaperCard({ paper, basePath = '/archives' }: PaperCardProps) {
    return (
        <Card className="border-primary/5 shadow-vip hover:shadow-vip-hover transition-all duration-500 group overflow-hidden bg-white rounded-[2rem]">
            <CardContent className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                    {/* Header info */}
                    <header className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="bg-primary text-white border-none text-xs font-black tracking-widest px-4 h-6 rounded-full shadow-sm">
                                Research Article
                            </Badge>
                            {paper.volume_number && (
                                <Badge variant="outline" className="text-xs font-black tracking-widest border-primary/10 text-primary/60 bg-primary/5 gap-2 px-4 h-6 rounded-full">
                                    <BookOpen className="w-3.5 h-3.5" /> Vol {paper.volume_number}, Issue {paper.issue_number} • {paper.publication_year}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black text-primary/30 tracking-widest">
                            Paper ID <span className="bg-primary/5 text-primary/60 px-3 py-1 rounded-lg border border-primary/5 font-mono">{paper.paper_id}</span>
                        </div>
                    </header>

                    <div className="space-y-4">
                        <Link href={`${basePath}/${paper.id}`}>
                            <h3 className=" font-black text-primary tracking-widest uppercase hover:text-secondary hover:translate-x-1 transition-all duration-500 cursor-pointer m-0">
                                {paper.title}
                            </h3>
                        </Link>

                        <dl className="flex flex-wrap items-center gap-8 pt-2">
                            <div className="flex items-center gap-4">
                                <dt className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/5 text-secondary shadow-sm" aria-label="Lead Author Icon">
                                    <User className="w-5 h-5" />
                                </dt>
                                <dd>
                                    <p className="text-xs font-black text-primary/30 tracking-widest m-0 uppercase">Lead Author</p>
                                    <p className="font-bold text-primary m-0">{paper.author_name}</p>
                                </dd>
                            </div>

                            {paper.affiliation && (
                                <div className="hidden sm:flex items-center gap-4 border-l border-primary/5 pl-8">
                                    <dt className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/5 text-primary/40 shadow-sm" aria-label="Affiliation Icon">
                                        <BookOpen className="w-5 h-5" />
                                    </dt>
                                    <dd>
                                        <p className="text-xs font-black text-primary/30 tracking-widest m-0 uppercase">Affiliation</p>
                                        <p className="text-primary/60 truncate max-w-xs xl:max-w-md m-0">{paper.affiliation}</p>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-primary/5">
                        <Button asChild className="btn-primary w-full sm:w-auto">
                            <Link href={`${basePath}/${paper.id}`} className="flex items-center gap-3">
                                <Eye className="w-4 h-4" /> Full Manuscript Details
                            </Link>
                        </Button>

                        {paper.file_path && (
                            <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 font-black text-xs tracking-widest border-primary/10 text-primary hover:bg-orange-600 rounded-xl transition-all">
                                <a href={paper.file_path} download className="flex items-center gap-3">
                                    <Download className="w-4 h-4" /> Download Tech Paper
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
