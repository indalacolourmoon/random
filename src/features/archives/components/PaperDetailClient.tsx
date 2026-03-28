'use client';

import {
    Download,
    User,
    BookOpen,
    Mail,
    Building2,
    Hash,
    ArrowLeft,
    FileText,
    Eye
} from "lucide-react";
import Link from "next/link";
import CitationSection from "./CitationSection";

interface PaperDetailClientProps {
    paper: any;
    id: string;
    mode?: 'current' | 'archive';
}

export default function PaperDetailClient({ paper, id, mode = 'archive' }: PaperDetailClientProps) {
    return (
        <div className="container-responsive -mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Article Content */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Title & Core Meta */}
                    <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-primary/5 text-primary text-[10px] font-black px-4 py-2 rounded-full  tracking-[0.2em] border border-primary/10">Research Article</span>
                                {paper.volume_number && (
                                    <span className="flex items-center gap-2 bg-secondary/5 text-secondary text-[10px] font-black px-4 py-2 rounded-full  tracking-[0.2em] border border-secondary/10">
                                        <BookOpen className="w-3 h-3" /> Volume {paper.volume_number}, Issue {paper.issue_number}
                                    </span>
                                )}
                                <span className="bg-gray-50 text-gray-600 text-[10px] font-black px-4 py-2 rounded-full  tracking-[0.2em] border border-gray-200">
                                    Published: {new Date(paper.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>

                            <h1 className=" font-serif font-black text-gray-900 leading-[1.15]">
                                {paper.title}
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100/80">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-600 tracking-widest mb-1">Corresponding Author</p>
                                        <h4 className=" font-bold text-gray-900">{paper.author_name}</h4>
                                        <p className="text-xs text-primary/80 font-bold flex items-center gap-1.5 mt-1">
                                            <Mail className="w-3 h-3" /> {paper.author_email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-600 tracking-widest mb-1">Affiliation</p>
                                        <h4 className=" font-bold text-gray-900 leading-snug">{paper.affiliation}</h4>
                                    </div>
                                </div>
                            </div>

                            {/* Co-Authors List */}
                            {paper.co_authors && (
                                <div className="pt-8 border-t border-gray-100/80 space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-600 tracking-widest uppercase">Contributing Co-Authors</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(() => {
                                            try {
                                                const coAuthors = JSON.parse(paper.co_authors);
                                                if (!Array.isArray(coAuthors)) return null;
                                                return coAuthors.map((author: any, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-4 group/coauthor">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 flex-shrink-0 group-hover/coauthor:bg-primary/5 group-hover/coauthor:border-primary/10 transition-colors">
                                                            <User className="w-5 h-5 text-gray-500 group-hover/coauthor:text-primary transition-colors" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h5 className=" font-bold text-gray-900 leading-none">{author.name}</h5>
                                                            <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">{author.designation}</p>
                                                            <p className="text-[11px] text-gray-700 font-medium leading-relaxed">{author.institution}</p>
                                                        </div>
                                                    </div>
                                                ));
                                            } catch (e) {
                                                console.error("Failed to parse co-authors", e);
                                                return null;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Abstract Section */}
                    <div className="bg-gray-50/50 p-10 md:p-14 rounded-[3rem] border border-gray-100 relative group">
                        <h2 className=" font-serif font-black text-gray-900 mb-8 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-primary opacity-50" /> Abstract
                        </h2>
                        <p className="text-gray-800 leading-[1.8] text-justify font-medium indent-8">
                            {paper.abstract}
                        </p>

                        {paper.keywords && (
                            <div className="mt-12 pt-8 border-t border-gray-200/50">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 tracking-widest mb-4">
                                    <Hash className="w-3 h-3" /> Keywords
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {paper.keywords.split(',').map((kw: string, i: number) => (
                                        <span key={i} className="bg-white px-4 py-2 rounded-xl text-[10px] font-bold text-gray-700 border border-gray-300 tracking-widest shadow-sm">
                                            {kw.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PDF Viewer Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-6">
                            <h2 className=" font-serif font-black text-gray-900">Manuscript Viewer</h2>
                            <a
                                href={paper.file_path}
                                download
                                className="flex items-center gap-2 text-primary font-black text-[10px]  tracking-widest hover:underline"
                            >
                                <Download className="w-4 h-4" /> Download Full Paper (PDF)
                            </a>
                        </div>
                        <div className="w-full h-[800px] bg-gray-100 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden relative group " >
                            <div className="absolute inset-0 bg-gray-900/5 items-center justify-center flex z-0">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-xs font-black text-gray-600 tracking-widest">Initialising Digital Reader</p>
                                </div>
                            </div>
                            <iframe
                                src={`${paper.file_path}#toolbar=0&view=FitH`}
                                className="w-full h-full relative z-10 border-none"
                                title="Manuscript Viewer"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-8">
                    <div className="flex flex-col gap-4 px-4 ">
                        <a
                            href={paper.file_path}
                            target="_blank"
                            className="w-full flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-2xl font-black text-[10px] sm:text-xs tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1 z-10"
                        >
                            <Eye className="w-4 h-4" /> Full Screen View
                        </a>
                    </div>
                    
                    {/* Citation Widget (Client Component) */}
                    <CitationSection paper={paper} />

                    <div className="flex flex-col gap-4 px-4">
                        <Link
                            href={mode === 'current' ? '/current-issue' : '/archives'}
                            className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-all font-black text-[10px] tracking-[0.2em]"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to {mode === 'current' ? 'Current Issue' : 'Full Archives'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
