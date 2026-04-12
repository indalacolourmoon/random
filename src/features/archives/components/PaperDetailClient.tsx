'use client';

import {
    Download,
    BookOpen,
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
    const isRetracted = paper.status === 'retracted';

    return (
        <div className="container-responsive -mt-10">
            {isRetracted && (
                <div className="mb-12 bg-red-50 border-2 border-red-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-red-900/5 animate-pulse">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 rotate-3">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="font-serif font-black text-red-900 text-xl md:text-2xl mb-1 uppercase tracking-tighter">Manuscript Retracted</h3>
                        <p className="text-red-700 font-bold text-sm leading-relaxed max-w-2xl">
                            This article has been formally retracted due to editorial policy violations or significant technical inaccuracies. 
                            Please refer to the official retraction notice for detailed reasoning.
                        </p>
                    </div>
                    {paper.retraction_notice_url && (
                        <a 
                            href={paper.retraction_notice_url} 
                            className="bg-red-900 text-white px-8 py-4 rounded-xl font-black text-[10px] tracking-[0.2em] hover:bg-red-800 transition-colors shadow-lg shadow-red-900/20"
                        >
                            VIEW NOTICE
                        </a>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Article Content */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Title & Core Meta */}
                    <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-primary/5 text-primary text-md px-4 py-2 rounded-full  border border-primary/10">Research Article</span>
                                {paper.volume_number && (
                                    <span className="flex items-center gap-2 bg-primary/5 text-primary text-md px-4 py-2 rounded-full   border border-secondary/10">
                                        <BookOpen className="w-3 h-3" /> Volume {paper.volume_number}, Issue {paper.issue_number}
                                    </span>
                                )}
                                <span className="bg-primary/5 text-primary text-md px-4 py-2 rounded-full  border border-gray-200">
                                    Published: {new Date(paper.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>

                            <h1 className=" font-serif font-black text-gray-900 leading-[1.15]">
                                {paper.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-6 border-t border-gray-100">
                                <span className="-black  tracking-widest  shrink-0">Authors <span className="text-red-600 font-bold">:</span></span>
                                <div className="flex flex-wrap items-center gap-x-2">
                                    <span className="font-normal leading-tight">{paper.author_name}</span>
                                    {paper.co_authors && (() => {
                                        try {
                                            const coAuthors = JSON.parse(paper.co_authors);
                                            if (!Array.isArray(coAuthors)) return null;
                                            return coAuthors.map((author: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-gray-900 font-bold">,</span>
                                                    <span className=" font-normal font-black leading-tight">{author.name}</span>
                                                </div>
                                            ));
                                        } catch (e) {
                                            console.error("Failed to parse co-authors", e);
                                            return null;
                                        }
                                    })()}
                                </div>
                            </div>

                            
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
