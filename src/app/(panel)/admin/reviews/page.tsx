'use client'

import { ShieldAlert, User, Mail, FileUp, CheckCircle, Clock, Search, Plus, X, Download, FileText, FileCheck, AlertCircle, Calendar, ArrowRight, Trash2, Eye, ExternalLink, ChevronDown } from 'lucide-react';
import { useActiveReviews, useUnassignedPapers, useAssignReviewer, useUploadReviewFeedback } from '@/hooks/queries/useReviews';
import { useUsers } from '@/hooks/queries/useUsers';
import { decideSubmission } from '@/actions/submissions';
import { useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

function ReviewsContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const assignId = searchParams.get('assign');

    const reviewerId = session?.user && (session.user as any).role === 'reviewer' ? (session.user as any).id : undefined;

    const { data: reviews = [], isLoading: loadingReviews, refetch: refetchReviews } = useActiveReviews(reviewerId);
    const { data: unassigned = [], isLoading: loadingUnassigned } = useUnassignedPapers();
    const { data: staff = [], isLoading: loadingStaff } = useUsers('reviewer');
    const assignMutation = useAssignReviewer();
    const uploadMutation = useUploadReviewFeedback();

    const loading = loadingReviews || loadingUnassigned || loadingStaff;

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [assignedFile, setAssignedFile] = useState<File | null>(null);
    const [feedbackFiles, setFeedbackFiles] = useState<{ [key: number]: File | null }>({});

    useEffect(() => {
        if (assignId) {
            setShowAssignModal(true);
        }
    }, [assignId]);

    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(assignId || "");

    if (loading) {
        return (
            <div className="p-32 2xl:p-48 text-center space-y-6 2xl:space-y-10">
                <div className="w-14 h-14 2xl:w-20 2xl:h-20 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-muted-foreground tracking-[0.2em] text-xs 2xl:text-sm uppercase animate-pulse">Synchronizing Review Pipeline...</p>
            </div>
        );
    }

    const user: any = session?.user;
    const isInternalStaff = user?.role === 'admin' || user?.role === 'editor';

    const filteredReviews = reviews.filter(r => {
        const matchesSearch =
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.reviewer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.paper_id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const selectedPaper = unassigned.find(p => p.id.toString() === selectedSubmissionId);
    const hasExistingPdf = !!selectedPaper?.pdf_url;

    return (
        <section className="space-y-8 pb-20">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold text-foreground tracking-widest capitalize leading-none">
                        {user?.role === 'reviewer' ? 'Deployment evaluations' : 'Peer review oversight'}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground/80 border-l-2 border-primary/10 pl-4">
                        {user?.role === 'reviewer'
                            ? 'Complete your assigned technical evaluations and archival validation protocols below.'
                            : 'Managing editorial integrity, strategic delegation, and reviewer assignment oversight.'}
                    </p>
                </div>
                {isInternalStaff && (
                    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                        <DialogTrigger asChild>
                            <Button className="h-12 xl:h-14 2xl:h-18 px-6 xl:px-8 2xl:px-12 gap-3 2xl:gap-5 bg-primary text-white font-semibold text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer dark:text-black capitalize">
                                <Plus className="w-5 h-5 2xl:w-7 2xl:h-7" />Assign reviewer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl rounded-xl p-5 bg-card border-primary/5 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2.5 bg-primary/10" />
                            <DialogHeader className="space-y-2">
                                <DialogTitle className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold text-foreground tracking-tight uppercase">Assignment Console</DialogTitle>
                                <DialogDescription className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
                                    Strategic delegation of manuscripts to the technical review staff.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={async (formData) => {
                                try {
                                    const result = await assignMutation.mutateAsync(formData);
                                    if (result.success) {
                                        toast.success('Reviewer assigned directly');
                                        setShowAssignModal(false);
                                        setAssignedFile(null);
                                    } else {
                                        toast.error(result.error);
                                    }
                                } catch (e) {
                                    toast.error('Failed to assign reviewer');
                                }
                            }} className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground tracking-widest px-1 uppercase">Target Manuscript</label>
                                    <Select
                                        name="submissionId"
                                        required
                                        defaultValue={selectedSubmissionId}
                                        onValueChange={setSelectedSubmissionId}
                                    >
                                        <SelectTrigger className="flex h-16 w-full rounded-xl bg-primary/5 border-none px-5 text-sm font-semibold transition-colors outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/5 appearance-none text-primary">
                                            <SelectValue placeholder="Choose Reference..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {unassigned.map(paper => (
                                                <SelectItem key={paper.id} value={paper.id.toString()}>{paper.paper_id} | {paper.title.slice(0, 40)}...</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground tracking-widest px-1 uppercase">Technical Reviewer</label>
                                    <Select name="reviewerId" required>
                                        <SelectTrigger className="flex h-16 w-full rounded-xl bg-primary/5 border-none px-5 text-sm font-semibold transition-colors outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/5 appearance-none text-primary">
                                            <SelectValue placeholder="Identify Staff..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {staff.map(r => (
                                                <SelectItem key={r.id} value={r.id.toString()}>{r.full_name} ({r.role})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground tracking-widest px-1 uppercase">Hard Deadline</label>
                                    <Input
                                        name="deadline"
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-16 bg-primary/5 border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-semibold text-sm rounded-xl text-primary px-5"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground tracking-widest px-1 uppercase text-primary">
                                        Secure PDF Manuscript {hasExistingPdf ? '(Optional - Already Attached)' : '(Required)'}
                                    </label>
                                    <div className={`relative group border-2 border-dashed ${assignedFile ? 'border-emerald-500/40 bg-emerald-500/5' : hasExistingPdf ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-primary/20 bg-primary/5'} rounded-xl p-6 transition-all hover:bg-primary/5 hover:border-primary/40`}>
                                        <input
                                            title="pdfFile"
                                            name="pdfFile"
                                            type="file"
                                            accept=".pdf"
                                            required={!hasExistingPdf}
                                            onChange={(e) => setAssignedFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex items-center justify-center pointer-events-none space-x-3">
                                            {assignedFile ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest truncate max-w-[200px]">{assignedFile.name}</p>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setAssignedFile(null);
                                                        }}
                                                        className="pointer-events-auto h-6 w-6 p-0 rounded-full hover:bg-rose-500/10 text-rose-500"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                </>
                                            ) : hasExistingPdf ? (
                                                <>
                                                    <FileCheck className="w-5 h-5 text-emerald-500" />
                                                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">Manuscript PDF already attached</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FileUp className="w-5 h-5 text-primary group-hover:scale-110 transition-all" />
                                                    <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">Select secure PDF manuscript</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="pt-6">
                                    <Button type="submit" disabled={assignMutation.isPending} className="w-full h-16 bg-primary text-white dark:text-slate-900 font-semibold text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs tracking-[0.3em] shadow-2xl shadow-primary/20 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
                                        {assignMutation.isPending ? 'SYNCHRONIZING...' : 'COMMIT ASSIGNMENT'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </header>

            {/* Registry Search & Filter */}
            <div className="flex flex-col md:flex-row items-center gap-5 2xl:gap-8 bg-muted/50 backdrop-blur-sm p-5 2xl:p-8 rounded-xl border border-primary/5 shadow-sm transition-all duration-500">
                <InputGroup className="flex-1 h-16 2xl:h-20 bg-card border-primary/5 rounded-xl shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                    <InputGroupAddon className="pl-6 2xl:pl-8 group-focus-within/input-group:text-primary transition-colors pr-2">
                        <Search className="w-5 h-5 2xl:w-7 2xl:h-7 text-primary/20" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search by Title, Node ID, or Reviewer Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-full px-6 2xl:px-8 font-semibold text-sm 2xl:text-lg bg-transparent border-0 ring-0 focus-visible:ring-0 transition-all"
                    />
                </InputGroup>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-14 xl:h-16 2xl:h-20 px-6 xl:px-8 2xl:px-10 bg-card border border-primary/5 rounded-xl text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold capitalize tracking-widest shadow-sm focus:ring-4 focus:ring-primary/5 transition-all text-primary min-w-[180px] 2xl:min-w-[280px]">
                            <SelectValue placeholder="Global status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                            <SelectItem value="all" className="font-semibold text-xs 2xl:text-sm uppercase tracking-widest">Global Status</SelectItem>
                            <SelectItem value="in_progress" className="font-semibold text-xs 2xl:text-sm uppercase tracking-widest">Pending Evaluation</SelectItem>
                            <SelectItem value="completed" className="font-semibold text-xs 2xl:text-sm uppercase tracking-widest">Evaluation Complete</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm sm:text-base lg:text-base xl:text-lg 2xl:text-xl font-semibold text-primary tracking-[0.4em] capitalize">Evaluation registry</h2>
                        <span className="text-xs font-semibold text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/5">{filteredReviews.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredReviews.map((item) => (
                        <Card key={item.id} className="border-primary/5 shadow-vip hover:shadow-2xl hover:scale-[1.005] transition-all group overflow-hidden bg-card relative">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${item.status === 'completed' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`} />
                            <CardContent className="p-0">
                                <div className="p-8 flex flex-col xl:flex-row xl:items-start justify-between gap-8">
                                    <div className="flex-1 space-y-4 min-w-0">
                                        <div className="flex items-center gap-3">
                                        <Badge className={`h-8 2xl:h-10 px-3 2xl:px-5 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.2em] shadow-sm rounded-lg ${item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-none' : 'bg-blue-500/10 text-blue-600 border-none'}`}>
                                            {item.status.replace('_', ' ')}
                                        </Badge>
                                        <div className="flex items-center gap-3 bg-primary/5 px-4 2xl:px-6 py-1.5 2xl:py-2.5 rounded-full border border-primary/5">
                                            <Badge variant="ghost" className="p-0 hover:bg-transparent"><User className="w-4 h-4 2xl:w-6 2xl:h-6 text-primary/30" /></Badge>
                                            <span className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-primary/60 tracking-widest uppercase">Node: {item.paper_id}</span>
                                        </div>
                                        <div className={`flex items-center gap-2.5 ${item.status === 'completed' ? 'text-primary/40' : 'text-orange-600'}`}>
                                            <Clock className="w-4 h-4 2xl:w-6 2xl:h-6" />
                                            <span className="text-xs 2xl:text-base font-semibold uppercase tracking-widest ">Due: {new Date(item.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-base xl:text-lg 2xl:text-2xl font-semibold text-primary dark:text-white leading-tight tracking-tight group-hover:text-secondary transition-all duration-500">
                                        {item.title}
                                    </h3>
                                        <div className="flex flex-wrap gap-10 items-center border-t border-primary/5 pt-6">
                                            <div className="space-y-2">
                                                <span className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-primary uppercase tracking-widest leading-relaxed">Assigned Technical Reviewer</span>
                                                <div className="flex items-center gap-3 text-sm font-semibold text-foreground dark:text-white ">
                                                    <User className="w-4.5 h-4.5 text-primary/40" />
                                                    <span>{item.reviewer_name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {item.feedback && (
                                            <div className="mt-6 p-6 bg-primary/[0.02] rounded-xl border border-primary/5 text-sm text-primary/80 font-medium leading-relaxed shadow-inner">
                                                <span className="text-primary font-semibold opacity-40 pr-2 text-lg">"</span>
                                                {item.feedback}
                                                <span className="text-primary font-semibold opacity-40 pl-2 text-lg">"</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="shrink-0 flex flex-col gap-3 xl:w-64 border-t xl:border-t-0 pt-6 xl:pt-0 border-primary/5">
                                        <div className="flex items-center gap-2 w-full">
                                            {item.manuscript_path && (
                                                <Button asChild variant="outline" className="flex-1 h-12 gap-2 font-semibold text-[9px] uppercase tracking-widest rounded-xl border-primary/10 text-primary hover:bg-primary transition-all shadow-sm cursor-pointer">
                                                    <a href={item.manuscript_path} className="flex items-center justify-center w-full" download>
                                                        <Download className="w-3.5 h-3.5 text-secondary mr-1" /> Source
                                                    </a>
                                                </Button>
                                            )}
                                            {item.feedback_file_path && (
                                                <Button asChild variant="outline" className="flex-1 h-12 gap-2 font-semibold text-[9px] uppercase tracking-widest rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 transition-all shadow-sm cursor-pointer">
                                                    <a href={item.feedback_file_path} className="flex items-center justify-center w-full" download>
                                                        <FileText className="w-3.5 h-3.5 mr-1" /> Intel
                                                    </a>
                                                </Button>
                                            )}
                                        </div>

                                        {item.status !== 'completed' && user?.role === 'reviewer' && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="w-full h-14 gap-3 font-semibold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-xl bg-primary text-white dark:text-slate-900 hover:scale-[1.05] hover:opacity-90 hover:text-white dark:hover:text-slate-900 active:scale-95 transition-all cursor-pointer">
                                                        <FileUp className="w-4 h-4" /> Submit Intel
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-xl rounded-xl p-10 bg-card border-primary/5 shadow-2xl">
                                                    <DialogHeader className="space-y-2">
                                                        <DialogTitle className="text-2xl font-semibold text-foreground tracking-tight uppercase">Final Evaluation</DialogTitle>
                                                        <DialogDescription className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
                                                            Commit technical feedback for Node: <span className="text-primary">{item.paper_id}</span>.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <form action={async (formData) => {
                                                        try {
                                                            const result = await uploadMutation.mutateAsync({ reviewId: item.id, formData });
                                                            if (result.success) {
                                                                toast.success('Feedback committed');
                                                            } else {
                                                                toast.error(result.error);
                                                            }
                                                        } catch (e) {
                                                            toast.error('Failed to submit findings');
                                                        }
                                                    }} className="space-y-6 pt-6">
                                                        <div className="space-y-3">
                                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Summary of Findings</label>
                                                            <textarea
                                                                name="feedbackText"
                                                                required
                                                                rows={4}
                                                                className="w-full bg-primary/5 border-none rounded-xl p-5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 text-primary resize-none placeholder:text-primary/30"
                                                                placeholder="Initial vector of technical feedback..."
                                                            />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Deep Analysis Node (File)</label>
                                                            <div className={`relative group border-2 border-dashed ${feedbackFiles[item.id] ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-primary/20 bg-primary/5'} rounded-xl p-10 transition-all hover:bg-primary/5 hover:border-primary/40`}>
                                                                <input
                                                                    title="file"
                                                                    name="feedbackFile"
                                                                    type="file"
                                                                    onChange={(e) => setFeedbackFiles(prev => ({ ...prev, [item.id]: e.target.files?.[0] || null }))}
                                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                />
                                                                <div className="flex flex-col items-center justify-center pointer-events-none space-y-4">
                                                                    {feedbackFiles[item.id] ? (
                                                                        <>
                                                                            <CheckCircle className="w-8 h-8 text-emerald-500 animate-bounce" />
                                                                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest text-center truncate max-w-[250px]">{feedbackFiles[item.id]?.name}</p>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    setFeedbackFiles(prev => ({ ...prev, [item.id]: null }));
                                                                                }}
                                                                                className="pointer-events-auto mt-2 text-rose-500 hover:bg-rose-500/10 font-semibold text-[10px] uppercase tracking-widest"
                                                                            >
                                                                                REMOVE PAYLOAD
                                                                            </Button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <div className="w-14 h-14 rounded-xl bg-muted shadow-sm flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all">
                                                                                <FileUp className="w-6 h-6" />
                                                                            </div>
                                                                            <p className="text-xs font-semibold text-primary/60 dark:text-primary/80 uppercase tracking-widest">Upload Evaluation Payload</p>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <DialogFooter className="pt-6">
                                                            <Button type="submit" className="w-full h-16 bg-primary text-white dark:text-slate-900 font-semibold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 rounded-xl hover:scale-[1.01] hover:opacity-90 hover:text-white dark:hover:text-slate-900 active:scale-[0.99] transition-all cursor-pointer">
                                                                COMMIT FINDINGS
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        {item.status === 'completed' && isInternalStaff && !['accepted', 'rejected', 'published', 'paid'].includes(item.submission_status) && (
                                            <div className="grid grid-cols-1 gap-4 2xl:gap-6 mt-4 pt-8 2xl:mt-6 2xl:pt-10 border-t border-primary/5">
                                                <Button
                                                    onClick={async () => {
                                                        if (confirm('Authorize acceptance for this manuscript?')) {
                                                            const res = await decideSubmission(item.submission_id, 'accepted');
                                                            if (res.success) {
                                                                toast.success('Accepted');
                                                                refetchReviews();
                                                            }
                                                            else toast.error(res.error);
                                                        }
                                                    }}
                                                    className="w-full h-14 2xl:h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs 2xl:text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <CheckCircle className="w-5 h-5 2xl:w-7 2xl:h-7 mr-3" /> AUTHORIZE ACCEPT
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={async () => {
                                                        if (confirm('Commit final rejection?')) {
                                                            const res = await decideSubmission(item.submission_id, 'rejected');
                                                            if (res.success) {
                                                                toast.success('Rejected');
                                                                refetchReviews();
                                                            }
                                                            else toast.error(res.error);
                                                        }
                                                    }}
                                                    className="w-full h-14 2xl:h-20 font-semibold text-xs 2xl:text-sm uppercase tracking-widest border-rose-500/20 text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <X className="w-5 h-5 2xl:w-7 2xl:h-7 mr-3" /> COMMIT REJECT
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredReviews.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-40 bg-primary/[0.02] border-2 border-dashed border-primary/5 rounded-xl space-y-8">
                            <div className="w-24 h-24 rounded-xl bg-card shadow-xl flex items-center justify-center text-primary/10 border border-primary/5">
                                <ShieldAlert className="w-12 h-12" />
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-lg font-semibold text-primary/40 uppercase tracking-[0.4em]">Queue Empty</h3>
                                <p className="text-xs font-semibold text-primary/20 tracking-widest uppercase">No technical evaluations active in this sector.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section >
    );
}

export default function Reviews() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-semibold text-muted-foreground  tracking-widest text-xs animate-pulse">Initializing Portal...</div>}>
            <ReviewsContent />
        </Suspense>
    );
}
