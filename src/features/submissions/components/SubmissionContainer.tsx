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
        case 'submitted': return 'bg-blue-600 text-white border-blue-700 shadow-sm';
        case 'under_review': return 'bg-amber-600 text-white border-amber-700 shadow-sm';
        case 'accepted': return 'bg-purple-600 text-white border-purple-700 shadow-sm';
        case 'rejected': return 'bg-rose-600 text-white border-rose-700 shadow-sm';
        case 'retracted': return 'bg-red-700 text-white border-red-800 shadow-sm';
        case 'paid': return 'bg-emerald-600 text-white border-emerald-700 shadow-sm';
        case 'published': return 'bg-cyan-600 text-white border-cyan-700 shadow-sm';
        default: return 'bg-muted text-muted-foreground border-none';
    }
};

const SubmissionMobileCard = React.memo(({ sub, role }: { sub: any, role: string }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={sub.id}
        className="p-6 space-y-4 bg-card border-b border-border/50 active:bg-muted/50 transition-colors"
    >
        <div className="flex justify-between items-start gap-4">
            <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono bg-muted px-2 py-1 rounded border border-border/50 opacity-60">
                        {sub.paper_id}
                    </span>
                    <Badge className={`h-6 px-3 rounded-lg border-none ${getStatusVariant(sub.status)}`}>
                        {sub.status.replace('_', ' ')}
                    </Badge>
                </div>
                <h4 className="font-serif text-foreground text-xl leading-tight">
                    {sub.title}
                </h4>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-xl border-border bg-card">
                    <DropdownMenuItem asChild className="rounded-lg h-12 gap-3 px-4 focus:bg-primary/10 focus:text-primary transition-all">
                        <Link href={`/${role}/submissions/${sub.id}`}>
                            <Eye className="w-4 h-4 text-primary" />
                            <span className="opacity-80">Inspect Manuscript</span>
                        </Link>
                    </DropdownMenuItem>
                    <Separator className="my-2" />
                    {role === 'admin' && sub.status !== 'published' && (
                        <div className="px-1 py-1">
                            <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <span className="opacity-40">Author</span>
                <p className="text-foreground truncate flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> {sub.author_name}
                </p>
            </div>
            <div className="space-y-1 text-right">
                <span className="opacity-40">Registry Date</span>
                <p className="text-foreground">
                    {new Date(sub.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
        </div>

        <Button asChild className="w-full h-12 bg-primary text-white rounded-xl hover:scale-[1.02] transition-all">
            <Link href={`/${role}/submissions/${sub.id}`}>Examine Dossier</Link>
        </Button>
    </motion.div>
));

SubmissionMobileCard.displayName = 'SubmissionMobileCard';

const SubmissionDesktopRow = React.memo(({ sub, idx, role }: { sub: any, idx: number, role: string }) => (
    <TableRow
        key={sub.id}
        className="border-b border-border/50 group hover:bg-muted/30 transition-all"
    >
        <TableCell className="px-6 py-6">
            <span className="font-mono bg-muted px-2 py-1 rounded border border-border/50 opacity-60">
                {sub.paper_id}
            </span>
        </TableCell>
        <TableCell className="px-6 py-6">
            <div className="flex flex-col gap-2 max-w-2xl">
                <h4 className="font-serif text-foreground text-xl leading-tight group-hover:text-primary transition-colors">
                    {sub.title}
                </h4>
                <div className="flex items-center gap-10 opacity-60">
                    <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> {sub.author_name}
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" /> {new Date(sub.submitted_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                </div>
            </div>
        </TableCell>
        <TableCell className="px-6 py-6">
            <div className="flex flex-col gap-2 items-center">
                <Badge className={`h-8 px-4 rounded-lg border-none shadow-sm ${getStatusVariant(sub.status)}`}>
                    {sub.status.replace('_', ' ')}
                </Badge>
                {sub.status === 'under_review' && sub.completed_reviews > 0 && (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <MessageSquare className="w-4 h-4" />
                        {sub.completed_reviews} REVIEWS
                    </div>
                )}
            </div>
        </TableCell>
        <TableCell className="px-6 py-6 text-right">
            <div className="flex items-center justify-end gap-4">
                <Button asChild className="h-10 px-6 bg-primary text-white rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.05] transition-all opacity-0 group-hover:opacity-100">
                    <Link href={`/${role}/submissions/${sub.id}`}>
                        EXAMINE
                    </Link>
                </Button>

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
                                    <span className="opacity-80">Decision Protocol</span>
                                    <span className="opacity-40">Manage Manuscript Lifecycle</span>
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
                                    <span className="opacity-60 group-hover:text-primary">Download MS</span>
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
            <div className="p-8 border-b border-border/50 bg-muted/20">
                <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between ">
                    <div className="flex-1">
                        <SubmissionSearch 
                            placeholder="Search manuscripts..." 
                            onLocalFilter={setFilterQuery}
                        />
                    </div>
                    <div className="flex items-center gap-6 px-8 py-4 bg-card rounded-2xl border border-border/50 shrink-0 shadow-sm transition-all hover:border-primary/20 self-start md:self-auto group">
                        <div className="flex flex-col items-end">
                            <span className="opacity-40">Active Records</span>
                            <span className="text-2xl text-primary">
                                {filteredSubmissions.length} <span className="opacity-30 mx-1">/</span> {submissions.length}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <FileText className="w-6 h-6 text-primary" />
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
            <div className="hidden md:block overflow-visible px-6">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-b border-border/50">
                            <TableHead className="h-14 px-6 opacity-40 w-40">System ID</TableHead>
                            <TableHead className="h-14 px-6 opacity-40">Manuscript Dossier</TableHead>
                            <TableHead className="h-14 px-6 opacity-40 w-48 text-center">Status</TableHead>
                            <TableHead className="h-14 px-6 opacity-40 w-40 text-right">Actions</TableHead>
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
