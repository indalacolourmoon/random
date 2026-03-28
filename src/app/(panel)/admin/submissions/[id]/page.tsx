import { getSubmissionById, updateSubmissionStatus, decideSubmission, updateSubmissionPdfUrl } from "@/actions/submissions";
import { assignPaperToIssue } from "@/actions/publications";
import { waivePayment } from "@/actions/payments";
import pool from "@/lib/db";
import DeleteSubmissionButton from "@/features/submissions/components/DeleteSubmissionButton";
import AdminPdfUpload from "@/features/submissions/components/AdminPdfUpload";
import PublicationAssignment from "@/features/submissions/components/PublicationAssignment";
import {
    Calendar,
    ChevronDown,
    User,
    Mail,
    FileText,
    Download,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    BookOpen,
    FileCheck,
    AlertCircle,
    ChevronRight,
    Globe,
    Edit3,
    Eye,
    History,
    MoreVertical,
    Share2,
    Lock,
    ArrowUpRight,
    MessageSquare,
    ExternalLink,
    Briefcase,
    Tag,
    ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const submission = await getSubmissionById(parseInt(id));
    if (!submission) return { title: 'Submission Not Found | Admin' };

    return {
        title: `Manage: ${submission.paper_id} | IJITEST Admin`,
        description: `Administrative oversight for manuscript ${submission.paper_id}: ${submission.title}`,
    };
}

export default async function SubmissionDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h2 className=" font-black text-foreground tracking-wider mb-2">Invalid Identification</h2>
                <p className="text-xs font-medium text-muted-foreground mb-6">The manuscript reference provided is not in a valid numerical format.</p>
                <Button asChild variant="outline" className="h-10 px-6 font-black text-[10px]  tracking-widest rounded-xl cursor-pointer">
                    <Link className="cursor-pointer" href="/admin/submissions">Return to Repository</Link>
                </Button>
            </div>
        );
    }

    const submission = await getSubmissionById(id);

    if (!submission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <h2 className=" font-black text-foreground tracking-wider mb-2">Manuscript Not Found</h2>
                <p className="text-xs font-medium text-muted-foreground mb-6 max-w-sm">The requested manuscript (Ref: {id}) could not be located in the primary database node.</p>
                <Button asChild variant="outline" className="h-10 px-6 font-black text-[10px]  tracking-widest rounded-xl cursor-pointer">
                    <Link className="cursor-pointer" href="/admin/submissions">Back to Submissions</Link>
                </Button>
            </div>
        );
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-indigo-500/10 text-indigo-600 border-none';
            case 'under_review': return 'bg-amber-500/10 text-amber-600 border-none';
            case 'accepted': return 'bg-purple-500/10 text-purple-600 border-none';
            case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-none';
            case 'published': return 'bg-cyan-500/10 text-cyan-600 border-none';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 border-none';
            default: return 'bg-muted text-muted-foreground border-none';
        }
    };

    return (
        <section className="space-y-6 pb-20">
            {/* Breadcrumb / Top Bar */}
            <div className="flex items-center justify-between gap-4">
                <Button asChild variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-primary font-black text-[10px]  tracking-widest -ml-2 cursor-pointer hover:text-white">
                    <Link className="cursor-pointer" href="/admin/submissions">
                        <ChevronLeft className="w-4 h-4" /> Submissions Console
                    </Link>
                </Button>
            </div>

            <Card className="border-border/50 shadow-lg overflow-hidden bg-background 2xl:rounded-3xl">
                <CardHeader className="p-8 bg-muted/20 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4 max-w-2xl 2xl:max-w-4xl">
                            <Badge className={`h-5 2xl:h-9 px-1.5 2xl:px-4 text-[9px] 2xl:text-base font-black tracking-widest whitespace-nowrap ${getStatusVariant(submission.status)}`}>
                                {submission.status.replace('_', ' ')}
                            </Badge>
                            <h1 className="font-black text-foreground tracking-widest uppercase leading-none 2xl:text-3xl">
                                {submission.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 2xl:gap-10 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-lg font-black text-muted-foreground tracking-widest capitalize">
                                <div className="flex items-center gap-2 2xl:gap-4">
                                    <Clock className="w-3.5 h-3.5 2xl:w-6 2xl:h-6 opacity-50" />
                                    <span>{new Date(submission.submitted_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                </div>
                                <div className="flex items-center gap-2 2xl:gap-4 text-primary">
                                    <Shield className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" />
                                    <span>{submission.paper_id}</span>
                                </div>
                                {submission.keywords && (
                                    <div className="flex items-center gap-2 2xl:gap-4">
                                        <Tag className="w-3.5 h-3.5 2xl:w-6 2xl:h-6 opacity-50" />
                                        <span className="truncate max-w-[200px] 2xl:max-w-md">{submission.keywords}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 2xl:gap-4 shrink-0">
                            {submission.file_path && (
                                <Button asChild className="h-11 2xl:h-16 px-6 2xl:px-10 gap-2 2xl:gap-4 bg-primary text-white font-black text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-lg tracking-widest rounded-xl 2xl:rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.05] hover:opacity-90 transition-all cursor-pointer">
                                    <a href={submission.file_path} download>
                                        <Download className="w-4 h-4 2xl:w-7 2xl:h-7" /> Download Manuscript
                                    </a>
                                </Button>
                            )}
                            <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-base font-bold text-muted-foreground text-center tracking-widest opacity-60">Authored by {submission.author_name}</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                        {/* Main Content (8 cols) */}
                        <div className="lg:col-span-8 p-8 space-y-12">
                            <div className="space-y-4 2xl:space-y-6">
                                <div className="flex items-center gap-2 2xl:gap-4 text-sm sm:text-base lg:text-base xl:text-lg 2xl:text-lg font-black text-muted-foreground tracking-[0.2em] opacity-60 uppercase">
                                    <FileText className="w-4 h-4 2xl:w-6 2xl:h-6" /> Abstract Overview
                                </div>
                                <div className="p-6 bg-muted/5 rounded-xl 2xl:rounded-3xl border border-border/30">
                                    <p className="text-sm 2xl:text-lg text-foreground leading-relaxed text-justify font-medium selection:bg-primary/20 ">
                                        {submission.abstract || "No abstract provided."}
                                    </p>
                                </div>
                            </div>

                            {submission.status !== 'submitted' && (
                                <div className="space-y-6 pt-4 border-t border-border/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 2xl:gap-4">
                                            <MessageSquare className="w-4 h-4 2xl:w-6 2xl:h-6 text-primary/40" />
                                            <span className="text-sm sm:text-base lg:text-base xl:text-lg 2xl:text-lg font-black text-muted-foreground tracking-[0.2em] opacity-60 uppercase">Reviewer Intelligence</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {(async () => {
                                            const [reviews]: any = await pool.execute(
                                                'SELECT r.*, u.full_name as reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.submission_id = ? AND r.status = "completed"',
                                                [submission.id]
                                            );

                                            if (reviews.length === 0) return (
                                                <div className="p-12 2xl:p-20 text-center bg-muted/10 rounded-xl 2xl:rounded-3xl border border-dashed border-border/50 flex flex-col items-center gap-4 2xl:gap-8">
                                                    <History className="w-8 h-8 2xl:w-14 2xl:h-14 text-muted-foreground/10" />
                                                    <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-lg font-black text-muted-foreground  tracking-widest ">Awaiting technical evaluation from assigned reviewers</p>
                                                </div>
                                            );

                                            return reviews.map((r: any, i: number) => (
                                                <Card key={r.id} className="border-border/50 shadow-none bg-muted/5 overflow-hidden 2xl:rounded-3xl">
                                                    <CardHeader className="p-4 2xl:p-8 bg-muted/20 border-b border-border/30 flex flex-row items-center justify-between">
                                                        <div className="flex items-center gap-2 2xl:gap-4">
                                                            <Badge variant="outline" className="h-5 2xl:h-8 px-1.5 2xl:px-4 text-[8px] 2xl:text-sm font-black tracking-widest bg-background border-border text-primary uppercase">Technical Reviewer {i + 1}</Badge>
                                                            <span className="text-[10px] 2xl:text-base font-black text-muted-foreground tracking-widest opacity-60">{r.reviewer_name}</span>
                                                        </div>
                                                        <CheckCircle className="w-4 h-4 2xl:w-7 2xl:h-7 text-emerald-500" />
                                                    </CardHeader>
                                                    <CardContent className="p-4 2xl:p-8">
                                                        <p className="text-xs 2xl:text-lg text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">"{r.feedback}"</p>
                                                    </CardContent>
                                                </Card>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar (4 cols) */}
                        <div className="lg:col-span-4 p-8 bg-muted/20 space-y-10">
                            <div className="space-y-4 2xl:space-y-6">
                                <h3 className="font-black text-muted-foreground tracking-[0.2em] opacity-60 uppercase 2xl:text-lg">Author Credentials</h3>
                                <Card className="border-border/50 shadow-sm bg-background 2xl:rounded-3xl">
                                    <CardContent className="p-5 space-y-4 2xl:space-y-8">
                                        <div className="flex items-start gap-3 2xl:gap-6">
                                            <div className="w-8 h-8 2xl:w-14 2xl:h-14 rounded-lg 2xl:rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 2xl:w-8 2xl:h-8 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black tracking-widest text-muted-foreground opacity-60 mb-0.5 uppercase">Corresponding Author</p>
                                                <p className="font-black text-xs 2xl:text-lg text-foreground tracking-wider">{submission.author_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 2xl:gap-6">
                                            <div className="w-8 h-8 2xl:w-14 2xl:h-14 rounded-lg 2xl:rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                                                <Mail className="w-4 h-4 2xl:w-8 2xl:h-8 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black tracking-widest text-muted-foreground opacity-60 mb-0.5 uppercase">Email Address</p>
                                                <p className="font-black text-xs 2xl:text-lg text-foreground tracking-wider truncate">{submission.author_email}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {submission.co_authors && (
                                    <div className="space-y-3 pt-2">
                                        <h4 className="text-[9px] 2xl:text-base font-black text-muted-foreground tracking-[0.2em] opacity-60 uppercase">Collaborating Authors</h4>
                                        <div className="space-y-2">
                                            {(() => {
                                                try {
                                                    const coAuthors = JSON.parse(submission.co_authors);
                                                    return coAuthors.map((author: any, idx: number) => (
                                                        <div key={idx} className="p-3 bg-white border border-border/50 rounded-xl space-y-1 shadow-sm">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-black text-[10px] 2xl:text-lg text-foreground tracking-wider">{author.name}</p>
                                                                <span className="text-[8px] 2xl:text-xs font-black text-primary/30 uppercase tracking-wider">CO-AUTH {idx + 1}</span>
                                                            </div>
                                                            <p className="text-[9px] 2xl:text-base font-medium text-muted-foreground truncate">{author.institution}</p>
                                                        </div>
                                                    ));
                                                } catch (e) {
                                                    return <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Metadata Corrupted</p>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-6">
                                <div className="flex flex-col gap-1.5">
                                    <h3 className=" font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 2xl:text-lg">Manuscript Processing</h3>
                                    <p className="text-[9px] 2xl:text-base font-bold text-muted-foreground/40 leading-relaxed uppercase tracking-widest">
                                        Finalize publication assets and formatting oversight.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <Card className="border-primary/10 shadow-sm bg-card/50 overflow-hidden">
                                        <CardContent className="p-6 space-y-6">
                                            <AdminPdfUpload submissionId={submission.id} currentUrl={submission.pdf_url} />

                                            <Separator className="bg-primary/5" />

                                            {submission.pdf_url ? (
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 transition-all">
                                                    <div className="relative">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Secure Asset</span>
                                                        <span className="text-[8px] font-bold text-emerald-600/50 uppercase tracking-wider">Verified for Publication</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/10">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 opacity-40" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Missing Review Asset</span>
                                                        <span className="text-[8px] font-bold text-rose-600/50 uppercase tracking-wider">Requires Technical Sync</span>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-4">
                                <h3 className=" font-black text-muted-foreground tracking-[0.2em] opacity-60">Decision Pipeline</h3>
                                <div className="space-y-3">
                                    {submission.status === 'submitted' && (
                                        <div className="space-y-3">
                                            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl space-y-2">
                                                <p className="text-[10px] font-black  text-orange-600 tracking-widest">Initial Assessment</p>
                                                <p className="text-[10px] font-medium text-orange-600/70">Manuscript is ready for reviewer assignment.</p>
                                            </div>
                                            <Button asChild className="w-full h-11 gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black text-[11px]  tracking-widest rounded-xl shadow-lg shadow-orange-600/10 cursor-pointer">
                                                <Link className="cursor-pointer" href={`/admin/reviews?assign=${submission.id}`}>
                                                    Assign to Reviewer
                                                </Link>
                                            </Button>
                                        </div>
                                    )}

                                    {submission.status === 'under_review' && (
                                        <div className="space-y-4">
                                            <div className="p-4 2xl:p-6 bg-primary/5 border border-primary/20 rounded-xl 2xl:rounded-2xl space-y-1 2xl:space-y-3">
                                                <p className="text-[10px] 2xl:text-base font-black  text-primary tracking-widest">Editorial Threshold</p>
                                                <p className="text-[10px] 2xl:text-lg font-medium text-primary/70 ">Final authorization required</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 2xl:gap-4">
                                                 <form action={async () => {
                                                    'use server';
                                                    await decideSubmission(submission.id, 'accepted');
                                                }}>
                                                    <Button className="w-full h-11 2xl:h-16 gap-2 2xl:gap-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] 2xl:text-lg tracking-widest rounded-xl shadow-xl shadow-emerald-600/20 cursor-pointer">
                                                        <CheckCircle className="w-4 h-4 2xl:w-6 2xl:h-6" /> Authorize Acceptance
                                                    </Button>
                                                </form>
                                                <form action={async () => {
                                                    'use server';
                                                    await decideSubmission(submission.id, 'rejected');
                                                }}>
                                                    <Button variant="outline" className="w-full h-11 2xl:h-16 gap-2 2xl:gap-4 border-red-500/20 text-red-600 font-black text-[11px] 2xl:text-lg tracking-widest rounded-xl cursor-pointer">
                                                        <XCircle className="w-4 h-4 2xl:w-6 2xl:h-6" /> Final Rejection
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {submission.status === 'accepted' && (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center space-y-3">
                                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black  text-emerald-600 tracking-widest">Authorized</p>
                                                    <p className="text-[10px] font-medium text-muted-foreground  tracking-widest ">Awaiting author remittance...</p>
                                                </div>
                                                <form action={async () => {
                                                    'use server';
                                                    await waivePayment(submission.id);
                                                }}>
                                                    <Button variant="outline" className="w-full h-9 gap-2 border-emerald-500/30 text-emerald-600 font-black text-[9px]  tracking-widest rounded-lg hover:bg-emerald-500 cursor-pointer">
                                                        Waive Transaction Fee
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {submission.status === 'published' && (
                                        <div className="space-y-4">
                                            <Card className="bg-emerald-950 text-white border-none overflow-hidden rounded-xl shadow-2xl">
                                                <CardContent className="p-8 space-y-6 relative">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                                                            <Globe className="w-5 h-5 text-emerald-400" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-black text-emerald-400  tracking-widest">In Archive</p>
                                                            <h3 className=" font-black tracking-wider ">Live Index</h3>
                                                        </div>
                                                    </div>
                                                    <Separator className="bg-white/10" />
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black  text-white/40 tracking-widest uppercase">Archive Node</p>
                                                            <p className="text-xs font-black">
                                                                {submission.volume_number && `Vol ${submission.volume_number}, Issue ${submission.issue_number}`}
                                                                {submission.start_page && `, pp. ${submission.start_page}-${submission.end_page}`}
                                                            </p>
                                                        </div>
                                                        <Button asChild variant="ghost" className="w-full h-10 gap-2 bg-white/5 hover:bg-white/10 text-white font-black text-[10px]  tracking-widest border border-white/10 rounded-xl cursor-pointer">
                                                            <Link className="cursor-pointer" href="/archives">
                                                                <ExternalLink className="w-3.5 h-3.5" /> View Public Archive
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {submission.status === 'paid' && (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black text-emerald-600  tracking-widest">Ready for Indexing</p>
                                                        <p className="text-[10px] font-medium text-muted-foreground ">Payment Verified</p>
                                                    </div>
                                                </div>

                                                <PublicationAssignment
                                                    submissionId={submission.id}
                                                    currentIssueId={submission.issue_id}
                                                />

                                                <Link
                                                    href="/admin/publications"
                                                    className="block text-[9px] font-black text-center text-emerald-600 hover:underline  tracking-widest opacity-60 pt-4"
                                                >
                                                    Access Volumes Terminal
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 mt-6 border-t border-border/50">
                                        {submission.status !== 'paid' && submission.status !== 'published' ? (
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black text-muted-foreground tracking-widest opacity-50 px-1">Dangerous Territory</h4>
                                                <DeleteSubmissionButton submissionId={submission.id} status={submission.status} variant="full" />
                                            </div>
                                        ) : (
                                            <div className="bg-muted p-4 rounded-xl border border-border/50  text-[9px] text-muted-foreground/60 font-black  tracking-widest text-center">
                                                Records Locked (Archived)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
