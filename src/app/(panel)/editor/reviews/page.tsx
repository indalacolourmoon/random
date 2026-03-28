'use client'
import { ShieldAlert, User, Mail, FileUp, CheckCircle, Clock, Search, Plus, X, Download, FileText, MoreVertical, AlertTriangle } from 'lucide-react';
import { useActiveReviews, useUnassignedPapers, useAssignReviewer, useUploadReviewFeedback } from '@/hooks/queries/useReviews';
import { useUsers } from '@/hooks/queries/useUsers';
import { decideSubmission } from '@/actions/submissions';
import { useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
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

    useEffect(() => {
        if (assignId) {
            setShowAssignModal(true);
        }
    }, [assignId]);

    if (loading) return <div className="p-24 2xl:p-40 text-center font-black text-primary/30 uppercase tracking-[0.3em] text-sm 2xl:text-base animate-pulse flex flex-col items-center gap-6 2xl:gap-10">
        <div className="w-16 h-16 2xl:w-24 2xl:h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        Scanning Review Database...
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
                            <Button className="h-12 2xl:h-16 px-6 2xl:px-10 gap-3 2xl:gap-4 bg-primary text-white dark:text-slate-900 font-black text-xs 2xl:text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer">
                                <Plus className="w-5 h-5 2xl:w-7 2xl:h-7" /> Assign New Reviewer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl rounded-xl p-8 border-none shadow-vip bg-card">
                            <DialogHeader className="space-y-3">
                                <DialogTitle className="text-2xl font-black text-foreground dark:text-primary tracking-wider uppercase">Assign Internal Expert</DialogTitle>
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
                            }} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label htmlFor="editor-assign-submissionId" className="text-[10px] font-black text-primary/60 tracking-widest px-1 uppercase ml-1">Select Manuscript</label>
                                    <Select name="submissionId" required defaultValue={assignId || ""}>
                                        <SelectTrigger id="editor-assign-submissionId" className="flex h-14 w-full rounded-xl bg-muted border-none px-5 py-2 text-sm font-bold transition-all outline-none ring-offset-background focus:ring-4 focus:ring-primary/5 appearance-none shadow-inner text-foreground dark:text-primary">
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
                                    <label htmlFor="editor-assign-reviewerId" className="text-[10px] font-black text-primary/60 tracking-widest px-1 uppercase ml-1">Available Reviewers</label>
                                    <Select name="reviewerId" required>
                                        <SelectTrigger id="editor-assign-reviewerId" className="flex h-14 w-full rounded-xl bg-muted border-none px-5 py-2 text-sm font-bold transition-all outline-none ring-offset-background focus:ring-4 focus:ring-primary/5 appearance-none shadow-inner text-foreground dark:text-primary">
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
                                    <label htmlFor="editor-assign-deadline" className="text-[10px] font-black text-primary/60 tracking-widest px-1 uppercase ml-1">Review Deadline</label>
                                    <Input
                                        id="editor-assign-deadline"
                                        name="deadline"
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-14 bg-muted border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-bold text-sm px-5 shadow-inner rounded-xl text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary tracking-widest px-1 uppercase ml-1">Secure PDF Manuscript (Required)</label>
                                    <div className="relative group border-2 border-dashed border-primary/20 rounded-xl p-6 transition-all hover:bg-primary/15 hover:border-primary/40 bg-primary/5">
                                        <input
                                            title="pdfFile"
                                            name="pdfFile"
                                            type="file"
                                            accept=".pdf"
                                            required
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex items-center justify-center pointer-events-none space-x-3">
                                            <FileUp className="w-5 h-5 text-primary group-hover:scale-110 transition-all" />
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Select secure PDF manuscript</p>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="pt-6">
                                    <Button type="submit" className="w-full h-16 font-black text-sm tracking-[0.3em] shadow-2xl shadow-primary/20 bg-primary text-white dark:text-slate-900 hover:scale-[1.02] transition-all uppercase rounded-xl cursor-pointer">
                                        CREATE ASSIGNMENT
                                    </Button>
                                </DialogFooter>
                                Collaborative working environment
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </header>

            <div className="grid grid-cols-1 gap-4">
                {reviews.map((item) => (
                    <Card key={item.id} className="border-primary/5 shadow-vip bg-card hover:border-primary/20 transition-all group overflow-hidden rounded-xl">
                        <CardContent className="p-0">
                            <div className="p-10 flex flex-col md:flex-row md:items-start justify-between gap-10">
                                <div className="flex-1 space-y-6 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge className={`h-7 2xl:h-10 px-4 2xl:px-6 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black uppercase tracking-[0.2em] rounded-lg shadow-sm border-none ${item.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                                            {item.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-mono font-black text-primary/30 uppercase tracking-[0.2em] bg-primary/5 px-3 2xl:px-4 py-1.5 2xl:py-2.5 rounded-lg border border-primary/5">
                                            Manuscript ID: {item.paper_id}
                                        </span>
                                    </div>

                                    <h3 className=" font-black text-foreground dark:text-primary leading-wider tracking-wider truncate group-hover:text-emerald-600 transition-all duration-500">
                                        {item.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-8 items-center">
                                        <div className="flex items-center gap-3 text-xs font-black text-primary/60 uppercase tracking-widest">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <span>Assigned: {item.reviewer_name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <span className={item.status === 'completed' ? 'text-primary/20 line-through' : 'text-orange-600'}>
                                                Submission Deadline: {new Date(item.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {item.feedback && (
                                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/5 text-sm md:text-base text-primary/70 font-medium leading-relaxed italic relative mt-4 shadow-inner">
                                            <span className="absolute -top-4 -left-1 text-4xl text-primary/20 font-serif">"</span>
                                            {item.feedback}
                                            <span className="absolute -bottom-8 -right-1 text-4xl text-primary/20 font-serif">"</span>
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 flex flex-col gap-3 min-w-[240px]">
                                    {item.manuscript_path && (
                                        <Button asChild variant="outline" className="h-12 gap-3 font-black text-xs uppercase tracking-widest border-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm cursor-pointer">
                                            <a href={item.manuscript_path} download>
                                                <Download className="w-5 h-5" /> Download Manuscript
                                            </a>
                                        </Button>
                                    )}

                                    {item.status !== 'completed' && user?.role === 'reviewer' ? (
                                        <Dialog open={selectedReview?.id === item.id} onOpenChange={(open) => !open && setSelectedReview(null)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => setSelectedReview(item)}
                                                    className="h-12 gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-all rounded-xl text-white dark:text-slate-900"
                                                >
                                                    <FileUp className="w-5 h-5" /> Submit Evaluation
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-xl rounded-xl p-8 border-none shadow-vip bg-card">
                                                <DialogHeader className="space-y-3">
                                                    <DialogTitle className="text-3xl font-black text-foreground dark:text-primary tracking-wider">Technical Evaluation</DialogTitle>
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
                                                }} className="space-y-6 pt-6">
                                                    <div className="space-y-2">
                                                        <label htmlFor={`editor-feedback-text-${item.id}`} className="text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Feedback Executive Summary</label>
                                                        <Textarea
                                                            id={`editor-feedback-text-${item.id}`}
                                                            name="feedbackText"
                                                            required
                                                            rows={6}
                                                            className="bg-primary/5 border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-bold text-sm px-5 py-4 shadow-inner rounded-xl resize-none placeholder:text-primary/20"
                                                            placeholder="Synthesize your key findings and technical critiques..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label htmlFor={`editor-feedback-file-${item.id}`} className="text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Deep Analysis Dossier (Optional)</label>
                                                        <div className="relative group">
                                                            <input
                                                                id={`editor-feedback-file-${item.id}`}
                                                                name="feedbackFile"
                                                                type="file"
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                                aria-label="Upload deep review file"
                                                            />
                                                            <div className="w-full bg-primary/5 border-2 border-dashed border-primary/10 p-10 rounded-xl group-hover:bg-primary/20 group-hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-4 shadow-inner">
                                                                <FileUp className="w-8 h-8 text-primary/30 group-hover:text-primary transition-colors animate-bounce" />
                                                                <span className="text-xs font-black text-primary/40 uppercase tracking-widest group-hover:text-primary transition-colors">Attach Evaluation Assets</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="pt-6">
                                                        <Button type="submit" className="w-full h-16 font-black text-sm tracking-[0.3em] shadow-2xl shadow-primary/20 bg-primary text-white dark:text-slate-900 hover:scale-[1.02] transition-all uppercase rounded-xl cursor-pointer">
                                                            Finalize evaluation
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    ) : item.feedback_file_path && (
                                        <Button asChild variant="secondary" className="h-12 gap-3 font-black text-xs uppercase tracking-widest bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none border-none rounded-xl transition-all cursor-pointer">
                                            <a href={item.feedback_file_path} download>
                                                <FileText className="w-5 h-5" /> View Feedback File
                                            </a>
                                        </Button>
                                    )}

                                    {item.status === 'completed' && isInternalStaff && !['accepted', 'rejected', 'published', 'paid'].includes(item.submission_status) && (
                                        <div className="grid grid-cols-2 gap-3 2xl:gap-5 mt-4 pt-6 2xl:mt-6 2xl:pt-8 border-t border-primary/5">
                                            <Button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to FINAL ACCEPT this paper? Authors will be notified.')) {
                                                        const res = await decideSubmission(item.submission_id, 'accepted');
                                                        if (res.success) {
                                                            toast.success('Accepted');
                                                            refetchReviews();
                                                        }
                                                        else toast.error(res.error);
                                                    }
                                                }}
                                                className="h-12 2xl:h-16 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 rounded-xl transition-all hover:scale-[1.05]"
                                            >
                                                <CheckCircle className="w-5 h-5 2xl:w-7 2xl:h-7" /> Accept
                                            </Button>
                                            <Button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to REJECT this paper? Feedback will be sent, and manuscript file will be deleted.')) {
                                                        const res = await decideSubmission(item.submission_id, 'rejected');
                                                        if (res.success) {
                                                            toast.success('Rejected');
                                                            refetchReviews();
                                                        }
                                                        else toast.error(res.error);
                                                    }
                                                }}
                                                variant="outline"
                                                className="h-12 2xl:h-16 gap-2 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.05]"
                                            >
                                                <X className="w-5 h-5 2xl:w-7 2xl:h-7" /> Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {reviews.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-32 bg-primary/5 border border-dashed border-primary/20 rounded-xl text-center">
                        <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center mb-8 shadow-inner">
                            <ShieldAlert className="w-12 h-12 text-primary/40" />
                        </div>
                        <h3 className=" font-black text-primary/60 tracking-wider mb-2">Queue Informationally Pure</h3>
                        <p className="text-xs font-black text-primary/30 uppercase tracking-[0.2em]">No peer reviews assigned to current staff profile</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default function Reviews() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-black text-muted-foreground  tracking-widest text-xs animate-pulse ">Initialising Review Portal...</div>}>
            <ReviewsContent />
        </Suspense>
    );
}
