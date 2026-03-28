'use client';

import React, { useState, useMemo } from 'react';
import {
    User,
    Calendar,
    MessageSquare,
    MoreVertical,
    FileText,
    Eye,
    Download
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import SubmissionSearch from './SubmissionSearch';
import DeleteSubmissionButton from './DeleteSubmissionButton';

interface SubmissionContainerProps {
    submissions: any[];
    currentStatus: string;
    role: 'admin' | 'editor';
}

export default function SubmissionContainer({ submissions, currentStatus, role }: SubmissionContainerProps) {
    const [filterQuery, setFilterQuery] = useState('');

    const filteredSubmissions = useMemo(() => {
        if (!filterQuery) return submissions;
        const q = filterQuery.toLowerCase();
        return submissions.filter(sub =>
            sub.paper_id.toLowerCase().includes(q) ||
            sub.title.toLowerCase().includes(q) ||
            sub.author_name.toLowerCase().includes(q)
        );
    }, [submissions, filterQuery]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-indigo-500/10 text-indigo-600 border-none';
            case 'under_review': return 'bg-amber-500/10 text-amber-600 border-none';
            case 'accepted': return 'bg-purple-500/10 text-purple-600 border-none';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 border-none';
            case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-none';
            case 'published': return 'bg-cyan-500/10 text-cyan-600 border-none';
            default: return 'bg-muted text-muted-foreground border-none';
        }
    };

    return (
        <div className="flex flex-col">
            {/* Search & Stats Header */}
            <div className="p-6 2xl:p-10 border-b border-primary/5 space-y-6 2xl:space-y-8 bg-primary/[0.02]">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between ">
                    <div className="flex-1">
                        <SubmissionSearch
                            placeholder="Type to filter results or click Search for Database..."
                            onLocalFilter={setFilterQuery}
                        />
                    </div>
                    <div className="flex items-center gap-4 px-6 2xl:px-12 py-3 2xl:py-6 bg-card rounded-xl 2xl:rounded-3xl border border-primary/10 shrink-0 shadow-sm transition-all hover:border-primary/20 self-start md:self-auto uppercase">
                        <FileText className="w-5 h-5 2xl:w-8 2xl:h-8 text-primary/40" />
                        <span className="text-xs 2xl:text-xl font-black text-primary/60 tracking-widest">
                            {filteredSubmissions.length} Showing / {submissions.length} Total
                        </span>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-primary/5">
                {filteredSubmissions.map((sub: any) => (
                    <div key={sub.id} className="p-6 space-y-4 bg-card active:bg-primary/[0.02] transition-colors relative">
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-[9px] bg-primary/5 px-2 py-1 rounded-md border border-primary/10 text-primary/60">
                                        {sub.paper_id}
                                    </span>
                                    <Badge className={`h-6 px-2 text-[9px] font-black tracking-widest border-none shadow-sm rounded-md ${getStatusVariant(sub.status)}`}>
                                        {sub.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <h4 className="font-black text-foreground dark:text-white text-[14px] leading-snug tracking-wider line-clamp-2">
                                    {sub.title}
                                </h4>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-primary/30 hover:text-primary rounded-xl -mr-2">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-xl p-3 shadow-2xl border-primary/5 bg-card">
                                    <DropdownMenuItem asChild className="rounded-xl h-12 gap-3 px-5">
                                        <Link href={`/${role}/submissions/${sub.id}`}>
                                            <FileText className="w-5 h-5 text-primary/40" />
                                            <span className="text-xs font-black tracking-widest uppercase">
                                                {role === 'admin' ? 'Decision Protocol' : 'Dossier Details'}
                                            </span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <Separator className="my-2 bg-primary/5" />
                                    {role === 'admin' && sub.status !== 'paid' && sub.status !== 'published' && (
                                        <div className="px-1 py-1">
                                            <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                                        </div>
                                    )}
                                    {role === 'editor' && sub.file_path && (
                                        <DropdownMenuItem asChild className="rounded-xl h-11 gap-3 group">
                                            <a href={sub.file_path} download>
                                                <Download className="w-5 h-5 text-primary/30 group-hover:text-primary" />
                                                <span className="text-xs font-black uppercase tracking-widest text-primary/60 group-hover:text-primary">Download MS</span>
                                            </a>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black text-primary/30 tracking-widest uppercase">
                            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-50" /> {sub.author_name}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-50" /> {new Date(sub.submitted_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            {sub.status === 'under_review' && sub.completed_reviews > 0 && (
                                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                                    <MessageSquare className="w-3 h-3" />
                                    ({sub.completed_reviews}) REVIEWS
                                </span>
                            )}
                        </div>
                        <Button asChild variant="outline" className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border-primary/10 hover:bg-primary/5">
                            <Link href={`/${role}/submissions/${sub.id}`}>View Full Dossier</Link>
                        </Button>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader className="bg-primary/[0.01]">
                        <TableRow className="hover:bg-transparent border-primary/5">
                            <TableHead className="h-12 2xl:h-24 px-4 2xl:px-8 text-[10px] 2xl:text-base font-black text-primary/40 tracking-[0.2em] uppercase w-40 2xl:w-64">Registry ID</TableHead>
                            <TableHead className="h-12 2xl:h-24 px-4 2xl:px-8 text-[10px] 2xl:text-base font-black text-primary/40 tracking-[0.2em] uppercase">Manuscript Dossier</TableHead>
                            <TableHead className="h-12 2xl:h-24 px-4 2xl:px-8 text-[10px] 2xl:text-base font-black text-primary/40 tracking-[0.2em] uppercase w-40 2xl:w-64 text-center">Protocol Status</TableHead>
                            <TableHead className="h-12 2xl:h-24 px-4 2xl:px-8 text-[10px] 2xl:text-base font-black text-primary/40 tracking-[0.2em] uppercase w-32 2xl:w-56 text-right">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubmissions.map((sub: any) => (
                            <TableRow key={sub.id} className="hover:bg-primary/[0.02] border-primary/5 group transition-colors">
                                <TableCell className="px-4 py-4">
                                    <span className="font-mono font-black text-[10px] bg-primary/5 px-2 py-1.5 rounded-lg border border-primary/10 text-primary/60 shadow-inner">
                                        {sub.paper_id}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-4">
                                    <div className="flex flex-col gap-1 2xl:gap-3 max-w-xl 2xl:max-w-4xl">
                                        <h4 className="font-black text-foreground dark:text-white text-[13px] 2xl:text-2xl leading-wider tracking-wider group-hover:text-secondary transition-colors truncate">
                                            {sub.title}
                                        </h4>
                                        <div className="flex items-center gap-4 2xl:gap-8 text-[10px] 2xl:text-base font-black text-primary/30 tracking-widest uppercase items-center">
                                            <span className="flex items-center gap-1.5 2xl:gap-3 whitespace-nowrap"><User className="w-3.5 h-3.5 2xl:w-6 2xl:h-6 opacity-50" /> {sub.author_name}</span>
                                            <span className="flex items-center gap-1.5 2xl:gap-3 whitespace-nowrap"><Calendar className="w-3.5 h-3.5 2xl:w-6 2xl:h-6 opacity-50" /> {new Date(sub.submitted_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-4">
                                    <div className="flex flex-col gap-2 2xl:gap-4 items-center">
                                        <Badge className={`h-7 2xl:h-12 px-2.5 2xl:px-6 text-[10px] 2xl:text-base font-black tracking-widest border-none shadow-sm rounded-md 2xl:rounded-xl ${getStatusVariant(sub.status)}`}>
                                            {sub.status.replace('_', ' ')}
                                        </Badge>
                                        {sub.status === 'under_review' && sub.completed_reviews > 0 && (
                                            <div className="flex items-center gap-1.5 2xl:gap-3 text-[9px] 2xl:text-sm font-black text-emerald-600 tracking-widest bg-emerald-500/5 px-2 py-0.5 2xl:px-4 2xl:py-1.5 rounded-full border border-emerald-500/10 uppercase">
                                                <MessageSquare className="w-3 h-3 2xl:w-5 2xl:h-5" />
                                                ({sub.completed_reviews})
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button asChild variant="ghost" size="icon" className="h-10 w-10 2xl:h-14 2xl:w-14 text-primary/40 hover:text-primary hover:bg-primary/5 rounded-lg shadow-inner border border-transparent hover:border-primary/10 transition-all group/btn cursor-pointer">
                                                        <Link className="cursor-pointer" href={`/${role}/submissions/${sub.id}`}>
                                                            <Eye className="w-5 h-5 2xl:w-7 2xl:h-7 group-hover/btn:scale-110 transition-transform" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-primary text-white text-[10px] font-black tracking-widest border-none px-4 py-2 rounded-xl shadow-2xl">
                                                    View Parameters
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-primary/30 hover:text-primary rounded-xl transition-colors cursor-pointer">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-64 rounded-xl p-3 shadow-2xl border-primary/5 bg-card">
                                                <DropdownMenuItem asChild className="rounded-xl h-12 gap-3 cursor-pointer focus:bg-primary/5 focus:text-primary transition-all px-5">
                                                    <Link className="cursor-pointer" href={`/${role}/submissions/${sub.id}`}>
                                                        <FileText className="w-5 h-5 text-primary/40" />
                                                        <span className="text-xs font-black tracking-widest uppercase">
                                                            {role === 'admin' ? 'Decision Protocol' : 'Dossier Details'}
                                                        </span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <Separator className="my-2 bg-primary/5" />
                                                {role === 'admin' && sub.status !== 'paid' && sub.status !== 'published' && (
                                                    <div className="px-1 py-1">
                                                        <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                                                    </div>
                                                )}
                                                {role === 'editor' && sub.file_path && (
                                                    <DropdownMenuItem asChild className="rounded-xl h-11 gap-3 group">
                                                        <a href={sub.file_path} download className="flex items-center gap-3">
                                                            <Download className="w-5 h-5 text-primary/30 group-hover:text-primary" />
                                                            <span className="text-xs font-black uppercase tracking-widest text-primary/60 group-hover:text-primary">Download MS</span>
                                                        </a>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
