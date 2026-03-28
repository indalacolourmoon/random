'use client'
import { ShieldAlert, User, Mail, FileUp, CheckCircle, Clock, Search, Plus, X, Download, FileText, Eye, AlertTriangle } from 'lucide-react';
import { useActiveReviews, useUnassignedPapers, useAssignReviewer, useUploadReviewFeedback } from '@/hooks/queries/useReviews';
import { useUsers } from '@/hooks/queries/useUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
    const [assignedFile, setAssignedFile] = useState<File | null>(null);
    const [feedbackFiles, setFeedbackFiles] = useState<{ [key: number]: File | null }>({});

    useEffect(() => {
        if (assignId) {
            setShowAssignModal(true);
        }
    }, [assignId]);

    if (loading) return <div className="p-24 text-center font-black text-muted-foreground uppercase tracking-[0.3em] text-xs animate-pulse min-h-[400px] flex items-center justify-center border-4 border-dashed rounded-xl border-primary/5 bg-primary/5">
        Accessing Review Assignments...
    </div>;

    const user: any = session?.user;
    const isInternalStaff = user?.role === 'admin' || user?.role === 'editor';

    return (
        <section className="space-y-6 pb-20">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                <div className="space-y-2">
                    <h1 className=" font-black text-foreground tracking-widest uppercase leading-none">
                        {user?.role === 'reviewer' ? 'My Assigned Reviews' : 'Peer Review Tracking'}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2 transition-all duration-500">
                        {user?.role === 'reviewer'
                            ? 'Complete your assigned manuscript evaluations below.'
                            : 'Managing editorial reviews and staff assignments.'}
                    </p>
                </div>
                {/* Closing Header conditionally */}
                {isInternalStaff && (
                    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 gap-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer">
                                <Plus className="w-5 h-5" /> Assign New Reviewer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl rounded-xl p-12 border-none shadow-vip">
                            <DialogHeader className="space-y-3">
                                <DialogTitle className="text-2xl font-black text-primary tracking-wider uppercase">Assign Expert Reviewer</DialogTitle>
                                <DialogDescription className="text-xs font-black text-primary/40 uppercase tracking-[0.2em]">
                                    Send manuscript to external staff for technical evaluation.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={async (formData) => {
                                try {
                                    const result = await assignMutation.mutateAsync(formData);
                                    if (result.success) {
                                        toast.success('Assignment created');
                                        setShowAssignModal(false);
                                    } else {
                                        toast.error(result.error);
                                    }
                                } catch (e) {
                                    toast.error('Failed to assign reviewer');
                                }
                            }} className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <label htmlFor="assign-submissionId" className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/60 tracking-widest px-1 uppercase ml-1">Select Manuscript</label>
                                    <Select name="submissionId" required defaultValue={assignId || ""}>
                                        <SelectTrigger id="assign-submissionId" title="Select a manuscript to assign" aria-label="Select manuscript" className="flex h-14 w-full rounded-xl bg-primary/5 px-5 py-1 text-sm font-bold transition-all outline-none border-none focus:ring-4 focus:ring-primary/5 appearance-none shadow-inner">
                                            <SelectValue placeholder="-- Choose a paper --" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {unassigned.map(paper => (
                                                <SelectItem key={paper.id} value={paper.id.toString()}>{paper.paper_id} - {paper.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="assign-reviewerId" className="text-[10px] font-black text-primary/60 tracking-widest px-1 uppercase ml-1">Available Reviewers</label>
                                    <Select name="reviewerId" required>
                                        <SelectTrigger id="assign-reviewerId" title="Select an available reviewer" aria-label="Available Reviewers" className="flex h-14 w-full rounded-xl bg-primary/5 px-5 py-1 text-sm font-bold transition-all outline-none border-none focus:ring-4 focus:ring-primary/5 appearance-none shadow-inner">
                                            <SelectValue placeholder="-- Choose a staff member --" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {staff.map(r => (
                                                <SelectItem key={r.id} value={r.id.toString()}>{r.full_name} ({r.email})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="assign-deadline" className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/60 tracking-widest px-1 uppercase ml-1">Review Deadline</label>
                                    <Input
                                        id="assign-deadline"
                                        name="deadline"
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-14 bg-primary/5 border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-bold text-sm px-5 rounded-xl shadow-inner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary tracking-widest px-1 uppercase font-black ml-1">Secure PDF Manuscript (Required)</label>
                                    <div className={`relative group border-2 border-dashed ${assignedFile ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-primary/20 bg-primary/5'} rounded-xl p-6 transition-all hover:bg-primary/5 hover:border-primary/40`}>
                                        <input
                                            title="pdfFile"
                                            name="pdfFile"
                                            type="file"
                                            accept=".pdf"
                                            required
                                            onChange={(e) => setAssignedFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex items-center justify-center pointer-events-none space-x-3">
                                            {assignedFile ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest truncate max-w-[200px]">{assignedFile.name}</p>
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
                                            ) : (
                                                <>
                                                    <FileUp className="w-5 h-5 text-primary group-hover:scale-110 transition-all" />
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Select secure PDF manuscript</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={assignMutation.isPending}
                                        className="w-full h-16 font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 rounded-xl bg-primary hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {assignMutation.isPending ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                COMMITTING...
                                            </div>
                                        ) : 'Send to Review'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </header>

            <div className="grid grid-cols-1 gap-4">
                {reviews.map((item) => (
                    <Card key={item.id} className="border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden dark:bg-black border-white hover:shadow-white hover:shadow-sm backdrop-blur-sm">
                        <CardContent className="p-0">
                            <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1 space-y-4 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge className={`h-6 px-3 text-[10px] font-black tracking-[0.2em] border-none shadow-sm rounded-lg ${item.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}>
                                            {item.status.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="outline" className="h-6 px-3 text-xs font-mono font-black text-primary/40 tracking-wider bg-primary/5 border-none rounded-lg">
                                            DOC-{item.paper_id}
                                        </Badge>
                                    </div>

                                    <h3 className=" font-black text-primary leading-wider tracking-wider group-hover:text-emerald-600 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-6 items-center">
                                        <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-primary/40 uppercase">
                                            <User className="w-5 h-5 opacity-40" />
                                            <span>Staff: {item.reviewer_name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] tracking-widest text-white dark:text-white bg-orange-500 px-4 py-2 rounded-xl border border-orange-500/10 uppercase font-black">
                                            <Clock className="w-5 h-5" />
                                            <span className={item.status === 'completed' ? 'line-through dark:decoration-white' : ''}>
                                                DEADLINE: {new Date(item.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>

                                    {item.feedback && (
                                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 text-sm text-primary/70 font-bold leading-relaxed relative pl-10 shadow-inner">
                                            <span className="absolute left-4 top-4 text-3xl text-emerald-500/30 font-serif leading-none dark:text-white">“</span>
                                            {item.feedback}
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 flex flex-col gap-3 min-w-[240px]">
                                    <Button asChild variant="outline" className="h-12 gap-3 font-black text-xs uppercase tracking-widest border-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl shadow-sm transition-all cursor-pointer">
                                        <Link className="cursor-pointer" href={`/reviewer/submissions/${item.submission_id}`}>
                                            <Eye className="w-5 h-5" /> Open Manuscript
                                        </Link>
                                    </Button>

                                    {item.status !== 'completed' && user?.role === 'reviewer' ? (
                                        <Dialog open={selectedReview?.id === item.id} onOpenChange={(open) => !open && setSelectedReview(null)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => setSelectedReview(item)}
                                                    className="h-12 gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 rounded-xl bg-primary hover:scale-[1.02] transition-all"
                                                >
                                                    <FileUp className="w-5 h-5" /> Submit Evaluation
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-2xl rounded-xl p-12 border-none shadow-vip">
                                                <DialogHeader className="space-y-3">
                                                    <DialogTitle className="text-3xl font-black text-primary tracking-wider">Submit Evaluation</DialogTitle>
                                                    <DialogDescription className="text-xs font-black text-primary/40 uppercase tracking-[0.2em]">
                                                        Provide your expert technical opinion on the manuscript.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form action={async (formData) => {
                                                    try {
                                                        const result = await uploadMutation.mutateAsync({ reviewId: item.id, formData });
                                                        if (result.success) {
                                                            toast.success('Evaluation finalized');
                                                            setSelectedReview(null);
                                                        } else {
                                                            toast.error(result.error);
                                                        }
                                                    } catch (e) {
                                                        toast.error('Failed to upload evaluation');
                                                    }
                                                }} className="space-y-8 pt-8">
                                                    <div className="space-y-2">
                                                        <label htmlFor={`feedback-text-${item.id}`} className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Feedback Summary</label>
                                                        <Textarea
                                                            id={`feedback-text-${item.id}`}
                                                            name="feedbackText"
                                                            required
                                                            rows={6}
                                                            className="bg-primary/5 border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-medium text-sm p-6 rounded-xl shadow-inner resize-none"
                                                            placeholder="Provide a summary of your key findings..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label htmlFor={`feedback-file-${item.id}`} className="text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Deep Review File (Optional)</label>
                                                        <div className={`relative group border-2 border-dashed ${feedbackFiles[item.id] ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-primary/10 bg-primary/5'} rounded-xl p-10 transition-all hover:bg-primary/10 hover:border-primary/20 shadow-inner`}>
                                                            <input
                                                                id={`feedback-file-${item.id}`}
                                                                name="feedbackFile"
                                                                type="file"
                                                                onChange={(e) => setFeedbackFiles(prev => ({ ...prev, [item.id]: e.target.files?.[0] || null }))}
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                aria-label="Upload evaluation file"
                                                            />
                                                            <div className="flex flex-col items-center justify-center pointer-events-none gap-4">
                                                                {feedbackFiles[item.id] ? (
                                                                    <>
                                                                        <CheckCircle className="w-8 h-8 text-emerald-500 animate-bounce" />
                                                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest text-center truncate max-w-[250px]">{feedbackFiles[item.id]?.name}</p>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                setFeedbackFiles(prev => ({ ...prev, [item.id]: null }));
                                                                            }}
                                                                            className="pointer-events-auto mt-2 text-rose-500 hover:bg-rose-500/10 font-black text-[10px] uppercase tracking-widest"
                                                                        >
                                                                            REMOVE PAYLOAD
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-16 h-16 rounded-xl bg-white/50 flex items-center justify-center shadow-sm">
                                                                            <FileUp className="w-8 h-8 text-primary shadow-sm" />
                                                                        </div>
                                                                        <span className="text-xs font-black text-primary/40 uppercase tracking-widest group-hover:text-primary transition-colors">Choose Evaluation File</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="pt-4">
                                                        <Button
                                                            type="submit"
                                                            disabled={uploadMutation.isPending}
                                                            className="w-full h-18 font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 rounded-xl bg-primary hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {uploadMutation.isPending ? (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                                    FINALIZING...
                                                                </div>
                                                            ) : 'Finalize evaluation'}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    ) : item.feedback_file_path && (
                                        <Button asChild variant="secondary" className="h-12 gap-3 font-black text-xs uppercase tracking-widest bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none border-none rounded-xl cursor-pointer">
                                            <a href={item.feedback_file_path} download>
                                                <FileText className="w-5 h-5" /> View Feedback File
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {reviews.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-32 bg-primary/5 border-4 border-dashed border-primary/5 rounded-xl animate-in fade-in zoom-in duration-500">
                        <ShieldAlert className="w-20 h-20 text-primary/10 mb-8" />
                        <h3 className=" font-black text-primary uppercase tracking-wider mb-2">Queue Empty</h3>
                        <p className="text-xs font-black text-primary/30 uppercase tracking-[0.2em] max-w-xs text-center leading-loose">No assigned reviews found in your portal at this moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default function Reviews() {
    return (
        <Suspense fallback={<div className="p-24 text-center font-black text-muted-foreground uppercase tracking-[0.3em] text-xs animate-pulse min-h-[400px] flex items-center justify-center border-4 border-dashed rounded-xl border-primary/5 bg-primary/5">
            Connecting to Staff Portal...
        </div>}>
            <ReviewsContent />
        </Suspense>
    );
}
