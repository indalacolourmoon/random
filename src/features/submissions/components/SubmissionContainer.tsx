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
import { motion } from 'framer-motion';
import SubmissionSearch from './SubmissionSearch';
import DeleteSubmissionButton from './DeleteSubmissionButton';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'submitted': return 'bg-blue-500/10 text-blue-700 border border-blue-200/50 dark:border-blue-500/20 shadow-sm';
        case 'under_review': return 'bg-amber-500/10 text-amber-700 border border-amber-200/50 dark:border-amber-500/20 shadow-sm';
        case 'accepted': return 'bg-purple-500/10 text-purple-700 border border-purple-200/50 dark:border-purple-500/20 shadow-sm';
        case 'rejected': return 'bg-rose-500/10 text-rose-700 border border-rose-200/50 dark:border-rose-500/20 shadow-sm';
        case 'retracted': return 'bg-red-600/10 text-red-600 border border-red-200/50 dark:border-red-500/20 shadow-sm';
        case 'paid': return 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm';
        case 'published': return 'bg-cyan-500/10 text-cyan-700 border border-cyan-200/50 dark:border-cyan-500/20 shadow-sm';
        default: return 'bg-muted text-muted-foreground border-none';
    }
};

const SubmissionMobileCard = React.memo(({ sub, role }: { sub: any, role: string }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={sub.id}
        className="p-8 space-y-6 bg-card active:bg-primary/2 transition-colors relative"
    >
        <div className="flex justify-between items-start gap-4">
            <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-[10px] bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 text-primary/60 shadow-inner">
                        {sub.paper_id}
                    </span>
                    <Badge className={`h-6 px-3 text-[9px] font-black tracking-[0.2em] shadow-sm rounded-lg uppercase ${getStatusVariant(sub.status)}`}>
                        {sub.status.replace('_', ' ')}
                    </Badge>
                    {sub.status === 'under_review' && sub.completed_reviews > 0 && (
                        <Badge variant="outline" className="h-6 px-2 text-[9px] font-black text-emerald-600 bg-emerald-500/5 border-emerald-500/20">
                            {sub.completed_reviews} REVIEWS
                        </Badge>
                    )}
                </div>
                <h4 className="font-serif font-black text-foreground text-lg leading-tight tracking-tight">
                    {sub.title}
                </h4>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-12 w-12 text-primary/30 hover:text-primary rounded-2xl -mr-3 bg-primary/5">
                        <MoreVertical className="w-6 h-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-3xl p-3 shadow-2xl border-primary/5 bg-white/95 backdrop-blur-xl">
                    <DropdownMenuItem asChild className="rounded-xl h-14 gap-4 px-5 focus:bg-primary/5 focus:text-primary transition-all">
                        <Link href={`/${role}/submissions/${sub.id}`}>
                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black tracking-widest uppercase">View Details</span>
                                <span className="text-[9px] text-muted-foreground font-bold">Open Protocol Dashboard</span>
                            </div>
                        </Link>
                    </DropdownMenuItem>
                    <Separator className="my-3 bg-primary/5" />
                    {role === 'admin' && sub.status !== 'published' && (
                        <div className="px-1 py-1">
                            <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4">
            <div className="space-y-1">
                <span className="text-[10px] font-black text-primary/20 tracking-widest uppercase">Corresponding Author</span>
                <p className="text-xs font-bold text-foreground flex items-center gap-2 truncate">
                    <User className="w-3.5 h-3.5 opacity-30" /> {sub.author_name}
                </p>
            </div>
            <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-primary/20 tracking-widest uppercase">Registry Date</span>
                <p className="text-xs font-bold text-foreground flex items-center gap-2 justify-end">
                    {new Date(sub.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
        </div>

        <Button asChild variant="outline" className="w-full h-14 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border-primary/10 hover:bg-primary/5 shadow-sm active:scale-[0.98] transition-all">
            <Link href={`/${role}/submissions/${sub.id}`}>Examine Full Dossier</Link>
        </Button>
    </motion.div>
));

SubmissionMobileCard.displayName = 'SubmissionMobileCard';

const SubmissionDesktopRow = React.memo(({ sub, idx, role }: { sub: any, idx: number, role: string }) => (
    <TableRow
        key={sub.id}
        className={`border-b border-primary/5 group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:bg-white relative z-[${100 - idx}]`}
    >
        <TableCell className="px-8 py-8">
            <span className="font-mono font-black text-[11px] bg-primary/5 px-3 py-2 rounded-xl border border-primary/10 text-primary/60 shadow-inner group-hover:bg-white transition-colors">
                {sub.paper_id}
            </span>
        </TableCell>
        <TableCell className="px-8 py-8">
            <div className="flex flex-col gap-2 max-w-2xl">
                <h4 className="font-serif font-black text-foreground text-xl leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {sub.title}
                </h4>
                <div className="flex items-center gap-8 text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
                    <span className="flex items-center gap-2 group-hover:text-foreground transition-colors">
                        <User className="w-4 h-4 opacity-40 text-primary" /> {sub.author_name}
                    </span>
                    <span className="flex items-center gap-2 group-hover:text-foreground transition-colors">
                        <Calendar className="w-4 h-4 opacity-40 text-primary" /> {new Date(sub.submitted_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                </div>
            </div>
        </TableCell>
        <TableCell className="px-8 py-8">
            <div className="flex flex-col gap-2 items-center">
                <Badge className={`h-9 px-5 text-[10px] font-black tracking-[0.2em] shadow-sm rounded-xl uppercase transition-transform group-hover:scale-105 duration-500 ${getStatusVariant(sub.status)}`}>
                    {sub.status.replace('_', ' ')}
                </Badge>
                {sub.status === 'under_review' && sub.completed_reviews > 0 && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 tracking-[0.2em] bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 uppercase animate-pulse">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {sub.completed_reviews} PEER-REVIEWS
                    </div>
                )}
            </div>
        </TableCell>
        <TableCell className="px-8 py-8 text-right">
            <div className="flex items-center justify-end gap-3">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild className="h-12 px-6 gap-3 bg-primary text-white dark:text-black font-black text-[10px] tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-500">
                                <Link href={`/${role}/submissions/${sub.id}`}>
                                    Examine Dossier
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-foreground text-background text-[10px] font-black tracking-widest border-none px-4 py-2 rounded-xl shadow-2xl">
                            Action Protocol
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 text-primary/30 hover:text-primary rounded-xl transition-all hover:bg-primary/5 cursor-pointer">
                            <MoreVertical className="w-6 h-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-3xl p-3 shadow-2xl border-primary/5 bg-white/95 backdrop-blur-xl">
                        <DropdownMenuItem asChild className="rounded-xl h-14 gap-4 px-5 focus:bg-primary/5 focus:text-primary transition-all">
                            <Link href={`/${role}/submissions/${sub.id}`}>
                                <FileText className="w-5 h-5 text-primary/40" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-black tracking-widest uppercase">Decision Protocol</span>
                                    <span className="text-[9px] text-muted-foreground font-bold">Manage Manuscript Lifecycle</span>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                        <Separator className="my-3 bg-primary/5" />
                        {role === 'admin' && sub.status !== 'published' && (
                            <div className="px-1 py-1">
                                <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                            </div>
                        )}
                        {role === 'editor' && sub.file_path && (
                            <DropdownMenuItem asChild className="rounded-xl h-12 gap-4 group">
                                <a href={sub.file_path} download className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                        <Download className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-primary/60 group-hover:text-primary">Download MS</span>
                                </a>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </TableCell>
    </TableRow>
));

SubmissionDesktopRow.displayName = 'SubmissionDesktopRow';

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

    return (
        <div className="flex flex-col">
            {/* Search & Stats Header */}
            <div className="p-8 border-b border-primary/5 space-y-6 bg-primary/1">
                <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between ">
                    <div className="flex-1">
                        <SubmissionSearch 
                            placeholder="Search by ID, Title or Author..." 
                            onLocalFilter={setFilterQuery}
                        />
                    </div>
                    <div className="flex items-center gap-6 px-8 py-4 bg-white/50 backdrop-blur-md rounded-2xl border border-primary/10 shrink-0 shadow-sm transition-all hover:border-primary/20 self-start md:self-auto group">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-primary/30 tracking-widest uppercase">Registry Yield</span>
                            <span className="text-xl font-black text-primary/80 tracking-tighter">
                                {filteredSubmissions.length} <span className="text-primary/20 mx-1">/</span> {submissions.length}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <FileText className="w-5 h-5 text-primary/40" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-primary/5">
                {filteredSubmissions.map((sub: any) => (
                    <SubmissionMobileCard key={sub.id} sub={sub} role={role} />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-visible px-4">
                <Table>
                    <TableHeader className="bg-primary/5 border-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="h-16 px-8 text-[10px] font-black text-primary/40 tracking-[0.3em] uppercase w-48">Registry ID</TableHead>
                            <TableHead className="h-16 px-8 text-[10px] font-black text-primary/40 tracking-[0.3em] uppercase">Manuscript Dossier</TableHead>
                            <TableHead className="h-16 px-8 text-[10px] font-black text-primary/40 tracking-[0.3em] uppercase w-56 text-center">Protocol Status</TableHead>
                            <TableHead className="h-16 px-8 text-[10px] font-black text-primary/40 tracking-[0.3em] uppercase w-40 text-right">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubmissions.map((sub: any, idx) => (
                            <SubmissionDesktopRow key={sub.id} sub={sub} idx={idx} role={role} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
