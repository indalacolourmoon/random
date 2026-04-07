'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { 
    ShieldAlert, User, FileUp, CheckCircle, Clock, Search, 
    Plus, X, Download, FileText, FileCheck, Eye, RefreshCw, Loader2 
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from '@/components/ui/separator';

import { useActiveReviews, useUnassignedPapers, useAssignReviewer, useSubmitReview } from '@/hooks/queries/useReviews';
import { useUsers } from '@/hooks/queries/useUsers';
import { decideSubmission, autoSyncManuscriptToPdf } from '@/actions/submissions';
import { useQueryClient } from '@tanstack/react-query';

// --- Sub-components ---

const ReviewItemCard = React.memo(({ 
    item, 
    user, 
    isInternalStaff, 
    onAccept, 
    onReject,
    onFeedbackSubmit 
}: { 
    item: any, 
    user: any, 
    isInternalStaff: boolean, 
    onAccept: (item: any) => void, 
    onReject: (item: any) => void,
    onFeedbackSubmit: (item: any, formData: FormData) => Promise<void>
}) => {
    const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        await onFeedbackSubmit(item, formData);
        setIsSubmitting(false);
    };

    const isReviewer = user?.role === 'reviewer';

    return (
        <Card className="border-border/50 shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-card rounded-2xl">
            <CardContent className="p-0">
                <div className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className={`h-7 px-4 text-[10px] font-bold tracking-widest border-none rounded-lg uppercase ${item.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-primary text-white'}`}>
                                {item.status.replace('_', ' ')}
                            </Badge>
                            <span className="font-mono font-bold text-[10px] bg-muted px-2 py-1 rounded border border-border/50 text-muted-foreground mr-1">
                                {item.paperId}
                            </span>
                        </div>

                        <h3 className="font-serif font-black text-foreground hover:text-primary transition-colors text-xl xl:text-2xl 2xl:text-3xl leading-tight">
                            {item.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-8 items-center pt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <User className="w-4 h-4 text-primary" />
                                <span>{item.reviewerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                <Clock className="w-4 h-4" />
                                <span>Due: {new Date(item.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {item.commentsToAuthor && (
                            <div className="mt-6 p-6 bg-muted/30 rounded-2xl border-l-4 border-l-primary text-base text-foreground leading-relaxed italic">
                                "{item.commentsToAuthor}"
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 flex flex-col gap-4 xl:w-72 border-t xl:border-t-0 pt-8 xl:pt-0 border-border/50">
                        <div className="flex flex-col gap-2 w-full">
                            {item.manuscriptPath && (
                                <Button asChild className="w-full h-12 gap-3 font-bold text-xs uppercase tracking-widest rounded-xl bg-primary text-white hover:scale-[1.02] transition-all cursor-pointer">
                                    <a href={item.manuscriptPath} className="flex items-center justify-center w-full" download>
                                        <Download className="w-4 h-4" /> Download MS
                                    </a>
                                </Button>
                            )}
                            {item.feedbackFilePath && (
                                <Button asChild variant="outline" className="w-full h-12 gap-3 font-bold text-xs uppercase tracking-widest rounded-xl border-emerald-600 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer">
                                    <a href={item.feedbackFilePath} className="flex items-center justify-center w-full" download>
                                        <FileText className="w-4 h-4" /> View Feedback
                                    </a>
                                </Button>
                            )}
                            {isReviewer && (
                                <Button asChild variant="outline" className="flex-1 h-12 gap-2 font-semibold text-[9px] uppercase tracking-widest rounded-xl border-primary/10 text-primary transition-all shadow-sm cursor-pointer">
                                    <Link href={`/reviewer/submissions/${item.submissionId}`}>
                                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {item.status !== 'completed' && isReviewer && (
                            <Dialog onOpenChange={(open) => !open && setFeedbackFile(null)}>
                                <DialogTrigger asChild>
                                    <Button className="w-full h-14 gap-3 font-semibold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-xl bg-primary text-white dark:text-slate-900 hover:scale-[1.05] transition-all cursor-pointer">
                                        <FileUp className="w-4 h-4" /> Submit Intel
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl rounded-xl p-6 bg-card border-border shadow-2xl">
                                    <DialogHeader className="space-y-1">
                                        <DialogTitle className="text-lg font-bold text-primary tracking-tight">Evaluation console</DialogTitle>
                                        <DialogDescription className="text-[11px] text-muted-foreground leading-relaxed">
                                            scientific assessment for paper: <span className="text-foreground underline decoration-primary/20">{item.paperId}</span>
                                        </DialogDescription>
                                    </DialogHeader>
                                    
                                    <form action={handleFormSubmit} className="space-y-5 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Primary decisions */}
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-muted-foreground">recommendation</label>
                                                    <Select name="decision" required>
                                                        <SelectTrigger className="h-11 bg-muted/30 border-border/50 rounded-lg px-4 text-sm">
                                                            <SelectValue placeholder="identify decision..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-border bg-card">
                                                            <SelectItem value="accept">accept manuscript</SelectItem>
                                                            <SelectItem value="minor_revision">minor revision</SelectItem>
                                                            <SelectItem value="major_revision">major revision</SelectItem>
                                                            <SelectItem value="reject">reject</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-medium text-muted-foreground">score (1-10)</label>
                                                        <Input 
                                                            name="score" 
                                                            type="number" 
                                                            min="1" 
                                                            max="10" 
                                                            required 
                                                            placeholder="8"
                                                            className="h-11 bg-muted/30 border-border/50 rounded-lg px-4 text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-medium text-muted-foreground">confidence (1-5)</label>
                                                        <Input 
                                                            name="confidence" 
                                                            type="number" 
                                                            min="1" 
                                                            max="5" 
                                                            required 
                                                            placeholder="4"
                                                            className="h-11 bg-muted/30 border-border/50 rounded-lg px-4 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-muted-foreground">confidential notes (for editor)</label>
                                                    <Textarea
                                                        name="commentsToEditor"
                                                        rows={3}
                                                        className="w-full bg-primary/5 border-none rounded-lg p-3 text-sm text-foreground resize-none"
                                                        placeholder="confidential notes for oversight..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Files and Authors */}
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-muted-foreground">comments to authors</label>
                                                    <Textarea
                                                        name="commentsToAuthor"
                                                        required
                                                        rows={5}
                                                        className="w-full bg-muted/30 border-border/50 rounded-lg p-3 text-sm text-foreground resize-none"
                                                        placeholder="technical feedback for authors..."
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-muted-foreground">technical report (pdf)</label>
                                                    <div className={`relative group border-2 border-dashed ${feedbackFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-muted/20'} rounded-lg p-4 transition-all hover:bg-muted/30 hover:border-primary/50`}>
                                                        <input
                                                            title="feedbackFile"
                                                            name="feedbackFile"
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={(e) => setFeedbackFile(e.target.files?.[0] || null)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="flex items-center justify-center pointer-events-none space-x-3">
                                                            {feedbackFile ? (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                    <p className="text-[11px] font-medium text-emerald-600 truncate max-w-[140px]">{feedbackFile.name}</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileUp className="w-4 h-4 text-primary/40 group-hover:scale-110 transition-all" />
                                                                    <p className="text-[11px] font-medium text-primary/60">select assessment pdf</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="pt-2 border-t border-border/50">
                                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary text-white dark:text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer">
                                                {isSubmitting ? 'committing findings...' : 'commit findings'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}

                        {item.status === 'completed' && isInternalStaff && !['accepted', 'rejected', 'published', 'paid'].includes(item.submissionStatus) && (
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-6 border-t border-primary/5">
                                <Button
                                    onClick={() => onAccept(item)}
                                    className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] uppercase tracking-widest rounded-xl transition-all"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" /> ACCEPT
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onReject(item)}
                                    className="h-12 font-semibold text-[10px] uppercase tracking-widest border-rose-500/20 text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all"
                                >
                                    <X className="w-4 h-4 mr-2" /> REJECT
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

ReviewItemCard.displayName = "ReviewItemCard";

// --- Main Registry Component ---

export function ReviewsRegistry({ role }: { role: 'admin' | 'editor' | 'reviewer' }) {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const assignIdFromUrl = searchParams.get('assign');

    const reviewerId = role === 'reviewer' ? (session?.user as any)?.id : undefined;

    const { data: reviews = [], isLoading: loadingReviews, refetch: refetchReviews } = useActiveReviews(reviewerId);
    const { data: unassigned = [], isLoading: loadingUnassigned } = useUnassignedPapers();
    const { data: staff = [], isLoading: loadingStaff } = useUsers('reviewer');
    const assignMutation = useAssignReviewer();
    const uploadMutation = useSubmitReview();
    const router = useRouter();
    const queryClient = useQueryClient();

    const loading = loadingReviews || loadingUnassigned || loadingStaff;

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [assignFile, setAssignFile] = useState<File | null>(null);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(assignIdFromUrl || "");
    const [isConverting, setIsConverting] = useState(false);

    const handleAutoConvert = async () => {
        if (!selectedSubmissionId) return;
        setIsConverting(true);
        const tid = toast.loading("Converting archive...");
        try {
            const res = await autoSyncManuscriptToPdf(parseInt(selectedSubmissionId));
            if (res.success) {
                toast.success("Manuscript synchronized", { id: tid });
                queryClient.invalidateQueries({ queryKey: ['unassignedPapers'] });
                router.refresh();
            } else {
                toast.error(res.error || "Conversion failed", { id: tid });
            }
        } catch (e) {
            toast.error("Failed to connect to conversion engine", { id: tid });
        } finally {
            setIsConverting(false);
        }
    };

    useEffect(() => {
        if (assignIdFromUrl) {
            setShowAssignModal(true);
            setSelectedSubmissionId(assignIdFromUrl);
        }
    }, [assignIdFromUrl]);

    const handleAccept = useCallback(async (item: any) => {
        if (confirm('Authorize acceptance for this manuscript?')) {
            const res = await decideSubmission(item.submissionId, 'accepted');
            if (res.success) {
                toast.success('Accepted');
                refetchReviews();
            } else toast.error(res.error);
        }
    }, [refetchReviews]);

    const handleReject = useCallback(async (item: any) => {
        if (confirm('Commit final rejection?')) {
            const res = await decideSubmission(item.submissionId, 'rejected');
            if (res.success) {
                toast.success('Rejected');
                refetchReviews();
            } else toast.error(res.error);
        }
    }, [refetchReviews]);

    const handleFeedbackSubmit = useCallback(async (item: any, formData: FormData) => {
        const toastId = toast.loading('Committing findings...');
        try {
            const result = await uploadMutation.mutateAsync({ assignmentId: item.id, formData });
            if (result.success) {
                toast.success('Feedback committed', { id: toastId });
                refetchReviews();
            } else {
                toast.error(result.error, { id: toastId });
            }
        } catch (e) {
            toast.error('Failed to submit findings', { id: toastId });
        }
    }, [uploadMutation, refetchReviews]);

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesSearch =
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.reviewerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.paperId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [reviews, searchQuery, statusFilter]);

    const isInternalStaff = role === 'admin' || role === 'editor';
    const selectedPaper = unassigned.find(p => p.id.toString() === selectedSubmissionId);
    const hasExistingPdf = !!selectedPaper?.pdfUrl;

    if (loading) {
        return (
            <div className="p-32 text-center space-y-6">
                <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-muted-foreground tracking-[0.2em] text-xs uppercase animate-pulse">Accessing review pipeline...</p>
            </div>
        );
    }

    return (
        <section className="space-y-8 pb-20">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-border/50 pb-10">
                <div className="space-y-4">
                    <h1 className="text-4xl 2xl:text-6xl font-serif font-black text-primary tracking-tight">
                        {role === 'reviewer' ? 'Evaluations Registry' : 'Review Oversight'}
                    </h1>
                    <p className="text-sm 2xl:text-xl font-medium text-muted-foreground border-l-4 border-primary/20 pl-6 py-1 max-w-2xl leading-relaxed">
                        {role === 'reviewer'
                            ? 'Technical evaluation portal for manuscript archival validation and peer-review workflows.'
                            : 'Global administration of editorial integrity, staff delegation, and peer-review lifecycle.'}
                    </p>
                </div>
                {isInternalStaff && (
                    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 gap-3 bg-primary text-white font-semibold text-[10px] tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer dark:text-black uppercase">
                                <Plus className="w-4 h-4" />Assign reviewer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl rounded-xl p-5 bg-card border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-foreground tracking-tight uppercase">Assignment Console</DialogTitle>
                                <DialogDescription className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                    Strategic delegation of manuscripts to technical staff.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={async (formData) => {
                                const res = await assignMutation.mutateAsync(formData);
                                if (res.success) {
                                    toast.success('Reviewer assigned');
                                    setShowAssignModal(false);
                                    setAssignFile(null);
                                } else toast.error(res.error);
                            }} className="space-y-5 pt-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-1">Manuscript</label>
                                    <Select name="submissionId" required defaultValue={selectedSubmissionId} onValueChange={setSelectedSubmissionId}>
                                        <SelectTrigger className="h-14 bg-primary/5 border-none rounded-xl px-5 font-semibold text-primary">
                                            <SelectValue placeholder="Identify paper..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {unassigned.map(paper => (
                                                <SelectItem key={paper.id} value={paper.id.toString()}>{paper.paperId} | {paper.title.slice(0, 40)}...</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-1">Reviewer</label>
                                    <Select name="reviewerId" required>
                                        <SelectTrigger className="h-14 bg-primary/5 border-none rounded-xl px-5 font-semibold text-primary">
                                            <SelectValue placeholder="Identify staff..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {staff.map(r => (
                                                <SelectItem key={r.id} value={r.id.toString()}>{r.profile?.fullName || r.email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-1">Deadline</label>
                                    <Input
                                        name="deadline"
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-14 bg-primary/5 border-none rounded-xl px-5 font-semibold text-primary"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold text-primary tracking-widest uppercase">Manuscript PDF {hasExistingPdf ? '(Verified)' : '(Required)'}</label>
                                        {hasExistingPdf && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-pulse">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                <span className="text-[8px] font-black uppercase">System Asset Ready</span>
                                            </div>
                                        )}
                                    </div>

                                    {!hasExistingPdf && selectedSubmissionId && (
                                        <Button
                                            type="button"
                                            onClick={handleAutoConvert}
                                            disabled={isConverting}
                                            variant="outline"
                                            className="w-full h-14 gap-3 border-primary/20 bg-primary/5 text-primary font-black text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-white dark:hover:text-black transition-all shadow-xl shadow-primary/5 cursor-pointer group"
                                        >
                                            {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />}
                                            <span>Upload using PDF Converter</span>
                                        </Button>
                                    )}

                                    <div className={`relative group border-2 border-dashed ${assignFile ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-primary/20 bg-primary/5'} rounded-xl p-6 transition-all hover:bg-primary/5 hover:border-primary/40`}>
                                        <input
                                            title="pdfFile"
                                            name="pdfFile"
                                            type="file"
                                            accept=".pdf"
                                            required={!hasExistingPdf}
                                            onChange={(e) => setAssignFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex items-center justify-center pointer-events-none space-x-3">
                                            {assignFile ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest truncate max-w-[200px]">{assignFile.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FileUp className="w-5 h-5 text-primary/40 group-hover:scale-110 transition-all" />
                                                    <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest">
                                                        {hasExistingPdf ? 'Overwrite existing PDF' : 'Select manuscript PDF'}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={assignMutation.isPending || isConverting} className="w-full h-16 bg-primary text-white font-semibold text-[10px] tracking-[0.3em] rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all cursor-pointer dark:text-black">
                                        {assignMutation.isPending ? 'SYNCHRONIZING...' : 'COMMIT ASSIGNMENT'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </header>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-muted/20 p-8 rounded-2xl border border-border/50">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by manuscript ID or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 pl-14 pr-6 bg-card border-border/50 rounded-xl text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-14 px-8 bg-card border-border/50 rounded-xl text-xs font-bold uppercase tracking-widest text-primary min-w-[240px]">
                        <SelectValue placeholder="System Filter" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-card">
                        <SelectItem value="all" className="font-bold text-xs uppercase tracking-widest">All Records</SelectItem>
                        <SelectItem value="assigned" className="font-bold text-xs uppercase tracking-widest">Pending Evaluation</SelectItem>
                        <SelectItem value="completed" className="font-bold text-xs uppercase tracking-widest">Audit Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <h2 className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase opacity-40">Registry queue</h2>
                    <Badge variant="outline" className="text-[10px] font-bold text-primary/40 bg-primary/5 border-none">{filteredReviews.length}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredReviews.map((item) => (
                        <ReviewItemCard 
                            key={item.id} 
                            item={item} 
                            user={session?.user} 
                            isInternalStaff={isInternalStaff}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onFeedbackSubmit={handleFeedbackSubmit}
                        />
                    ))}

                    {filteredReviews.length === 0 && (
                        <div className="py-32 text-center bg-primary/2 border-2 border-dashed border-primary/5 rounded-xl space-y-4">
                            <ShieldAlert className="w-12 h-12 text-primary/10 mx-auto" />
                            <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">No matching evaluations found</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function ReviewsRegistrySuspense(props: any) {
    return (
        <Suspense fallback={<div className="p-20 text-center text-[10px] font-bold text-primary/20 tracking-widest animate-pulse">SYNCHRONIZING INTERFACE...</div>}>
            <ReviewsRegistry {...props} />
        </Suspense>
    );
}
