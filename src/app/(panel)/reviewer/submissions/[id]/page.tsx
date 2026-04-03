import { getSubmissionById } from "@/actions/submissions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
    Calendar,
    User,
    Mail,
    History,
    FileText,
    Download,
    ArrowLeft,
    Clock,
    Shield,
    BookOpen,
    Eye,
    Lock,
    Tag,
    ChevronLeft
} from "lucide-react";
import { PdfViewer } from "@/components/reviewer/PdfViewer";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const submission = await getSubmissionById(parseInt(id));
    if (!submission) return { title: 'Manuscript Not Found | Reviewer' };

    return {
        title: `Review: ${submission.paper_id} | IJITEST`,
        description: `Reviewer evaluation for manuscript ${submission.paper_id}`,
    };
}

export default async function ReviewerSubmissionView({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const session: any = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.role !== 'reviewer' && user.role !== 'admin' && user.role !== 'editor') {
        redirect('/login');
    }

    if (isNaN(id)) return notFound();

    const submission = await getSubmissionById(id);
    if (!submission) return notFound();

    // Verify assignment for reviewers
    if (user.role === 'reviewer') {
        const isAssigned = (submission as any).allReviews?.some((r: any) => r.reviewerId === user.id);
        if (!isAssigned) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                    <div className="w-24 h-24 rounded-xl bg-rose-500/10 flex items-center justify-center mb-8 shadow-inner shadow-rose-500/5">
                        <Lock className="w-12 h-12 text-rose-600" />
                    </div>
                    <h2 className=" font-black text-foreground tracking-wider mb-3">Access Restricted</h2>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest opacity-60 max-w-sm mb-10 leading-loose">
                        This manuscript has not been assigned to your profile for technical evaluation.
                    </p>
                    <Button asChild variant="outline" className="h-12 px-8 gap-3 font-bold text-[11px] tracking-widest rounded-xl transition-all uppercase shadow-sm cursor-pointer">
                        <Link className="cursor-pointer" href="/reviewer/reviews">
                            <ArrowLeft className="w-4 h-4" /> Back to My Assignments
                        </Link>
                    </Button>
                </div>
            );
        }
    }

    return (
        <section className="space-y-6 pb-20">
            {/* Breadcrumb / Top Bar */}
            <div className="flex items-center justify-between gap-4">
                <Button asChild variant="ghost" size="sm" className="h-9 px-3 gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-widest -ml-2 rounded-lg transition-all cursor-pointer">
                    <Link className="cursor-pointer" href="/reviewer/reviews">
                        <ChevronLeft className="w-4 h-4" /> Back to My Assignments
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Metadata (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-primary/5 shadow-vip overflow-hidden sticky top-24 rounded-xl pb-10 2xl:rounded-3xl bg-white">
                        <CardHeader className="p-8 2xl:p-14 bg-primary/5 border-b border-primary/5">
                            <div className="space-y-4 2xl:space-y-8">
                                <Badge className="h-6 2xl:h-9 px-3 2xl:px-5 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-base font-black tracking-[0.2em] bg-emerald-500 text-white border-none shadow-sm rounded-lg uppercase">
                                    Assigned for Review
                                </Badge>
                                <CardTitle className="text-xl sm:text-2xl lg:text-3xl xl:text-4.5xl 2xl:text-6xl font-black text-primary tracking-wider leading-wider dark:text-black">
                                    {submission.title}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-6 2xl:gap-10 text-[10px] 2xl:text-lg font-black text-primary/40 dark:text-black tracking-[0.2em] uppercase">
                                    <div className="flex items-center gap-2 2xl:gap-4">
                                        <Shield className="w-4 h-4 2xl:w-7 2xl:h-7" />
                                        <span>{(submission as any).paper_id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 2xl:gap-4">
                                        <Clock className="w-4 h-4 2xl:w-7 2xl:h-7" />
                                        <span>{new Date((submission as any).submitted_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 2xl:p-14 space-y-8 2xl:space-y-12">
                            <div className="space-y-4 2xl:space-y-8">
                                <h4 className="font-black text-primary/40 tracking-[0.2em] dark:text-green-900 flex items-center gap-3 uppercase 2xl:text-2xl">
                                    <FileText className="w-5 h-5 2xl:w-9 2xl:h-9" /> Abstract
                                </h4>
                                <p className="text-sm 2xl:text-xl text-primary/70 leading-relaxed 2xl:leading-loose font-medium text-justify italic dark:text-red-700">
                                    "{submission.abstract || "No abstract provided."}"
                                </p>
                            </div>

                            <Separator className="bg-primary/5 dark:bg-green-900" />

                            {submission.keywords && (
                                <div className="space-y-4">
                                    <h4 className="text-[9px] sm:text-[10px] xl:text-[11px] font-black text-primary/40 dark:text-green-900 tracking-[0.2em] flex items-center gap-3 uppercase">
                                        <Tag className="w-5 h-5" /> Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {submission.keywords.split(',').map((k: string) => (
                                            <Badge key={k} variant="outline" className="h-7 px-3 text-[10px] font-black tracking-widest border-primary/10 bg-primary/5 dark:text-blue-900 lg:text-xl text-primary rounded-lg uppercase">
                                                {k.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(submission as any).co_authors && (
                                <div className="space-y-4 pt-4 border-t border-primary/5">
                                    <h4 className=" font-black text-primary/40 dark:text-green-900 tracking-[0.2em] flex items-center gap-3 uppercase">
                                        <History className="w-5 h-5" /> Collaborating Authors
                                    </h4>
                                    <div className="space-y-3">
                                        {(() => {
                                            try {
                                                const coAuthors = JSON.parse((submission as any).co_authors);
                                                return coAuthors.map((author: any, idx: number) => (
                                                    <div key={idx} className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-1 shadow-sm">
                                                        <p className="font-black text-xs text-primary dark:text-black tracking-wider uppercase leading-none">{author.name}</p>
                                                        <p className="text-[10px] font-black text-primary/40 dark:text-black/60 truncate uppercase tracking-wider">{author.institution}</p>
                                                    </div>
                                                ));
                                            } catch (e) {
                                                return <p className="text-[10px] font-black text-rose-500 uppercase">Metadata Conflict</p>;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 2xl:pt-8">
                                {(submission as any).pdf_url ? (
                                    <>
                                        <Button asChild className="w-full h-12 2xl:h-20 gap-3 2xl:gap-5 font-bold text-[11px] 2xl:text-xl tracking-widest shadow-xl shadow-primary/20 rounded-xl 2xl:rounded-2xl bg-primary hover:opacity-90 transition-all uppercase cursor-pointer text-white dark:text-black">
                                            <a href={(submission as any).pdf_url} download>
                                                <Download className="w-4 h-4 2xl:w-8 2xl:h-8" /> Download PDF
                                            </a>
                                        </Button>
                                        <p className="text-[10px] 2xl:text-base font-bold text-primary/30 text-center mt-4 2xl:mt-8 tracking-widest uppercase">
                                            Official Review Version (Protected)
                                        </p>
                                    </>
                                ) : (
                                    <div className="p-6 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-3">
                                        <div className="flex items-center gap-2 text-rose-600">
                                            <Lock className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Asset Restricted</span>
                                        </div>
                                        <p className="text-[10px] font-semibold text-rose-600/70 leading-relaxed uppercase tracking-wider">
                                            The secure PDF version is currently being generated by the Editorial Office.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    <Card className="border-border/50 shadow-sm overflow-hidden h-[100vh] min-h-[85vh] bg-muted/10">
                        <CardContent className="p-0 h-full flex flex-col">
                            {submission.pdf_url ? (
                                <div className="flex-1 min-h-[85vh] relative group">
                                    <PdfViewer
                                        pdfUrl={submission.pdf_url}
                                        title={submission.title}
                                    />
                                    <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                    <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center shadow-inner">
                                        <Shield className="w-10 h-10 text-primary/30" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className=" font-black text-primary tracking-wider uppercase">Secure Preview Pending</h3>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest opacity-60 max-w-xs mx-auto leading-relaxed">
                                            The editorial board has not yet synchronized the secure PDF version for this manuscript.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border">
                                        <History className="w-3.5 h-3.5 text-muted-foreground animate-spin-slow" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Synchronization in Progress</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
