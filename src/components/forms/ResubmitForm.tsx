"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resubmitPaper } from "@/actions/author-submissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, CheckCircle, FileText, Loader2 } from "lucide-react";

interface ResubmitFormProps {
    submissionId: number;
    paperId: string;
    title: string;
    daysRemaining: number;
    currentStatus: string;
}

export function ResubmitForm({ submissionId, paperId, title, daysRemaining, currentStatus }: ResubmitFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [manuscript, setManuscript] = useState<File | null>(null);
    const [copyright, setCopyright] = useState<File | null>(null);

    const isUrgent = daysRemaining <= 5;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!manuscript) return setError("Please upload the revised manuscript.");
        if (!copyright) return setError("Please upload the copyright form.");

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.set("manuscript", manuscript);
        formData.set("copyright_form", copyright);

        const result = await resubmitPaper(submissionId, formData);
        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            setTimeout(() => router.push(`/author/submissions/${submissionId}`), 2500);
        }
    }

    if (success) {
        return (
            <Card className="border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                    <h3 className="font-black text-xl uppercase tracking-widest text-foreground">Resubmission Received</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Your revised manuscript has been submitted. The editorial team will be notified. Redirecting…
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Urgency Banner */}
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${isUrgent
                ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                    <span className="font-black">{daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining</span> to submit your revision.
                    Failure to resubmit will deactivate your account.
                </span>
            </div>

            {/* Paper info */}
            <Card className="border-border/50 bg-muted/10">
                <CardContent className="p-5 space-y-2">
                    <p className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Revising Submission</p>
                    <p className="font-bold text-foreground line-clamp-2">{title}</p>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-mono">{paperId}</Badge>
                        <Badge className="text-[9px] bg-orange-500/10 text-orange-600 border-none capitalize">
                            {currentStatus.replace('_', ' ')}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Manuscript Upload */}
            <div className="space-y-2">
                <Label htmlFor="manuscript-upload" className="text-xs font-bold uppercase tracking-widest text-foreground/80">
                    Revised Manuscript <span className="text-rose-500">*</span>
                </Label>
                <div
                    className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${manuscript ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-500/5' : 'border-border hover:border-primary/40 bg-muted/10'}`}
                    onClick={() => document.getElementById('manuscript-upload')?.click()}
                >
                    <input
                        id="manuscript-upload"
                        type="file"
                        title="Upload revised manuscript"
                        accept=".doc,.docx,.pdf"
                        className="hidden"
                        onChange={(e) => setManuscript(e.target.files?.[0] || null)}
                    />
                    {manuscript ? (
                        <>
                            <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                            <p className="text-sm font-bold text-foreground">{manuscript.name}</p>
                            <p className="text-[10px] text-muted-foreground">{(manuscript.size / 1024).toFixed(0)} KB</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-bold text-muted-foreground">Click to upload revised manuscript</p>
                            <p className="text-[10px] text-muted-foreground/70">DOC, DOCX, or PDF (max 20MB)</p>
                        </>
                    )}
                </div>
            </div>

            {/* Copyright Upload */}
            <div className="space-y-2">
                <Label htmlFor="copyright-upload" className="text-xs font-bold uppercase tracking-widest text-foreground/80">
                    Copyright Form <span className="text-rose-500">*</span>
                </Label>
                <div
                    className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${copyright ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-500/5' : 'border-border hover:border-primary/40 bg-muted/10'}`}
                    onClick={() => document.getElementById('copyright-upload')?.click()}
                >
                    <input
                        id="copyright-upload"
                        type="file"
                        title="Upload signed copyright form"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setCopyright(e.target.files?.[0] || null)}
                    />
                    {copyright ? (
                        <>
                            <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                            <p className="text-sm font-bold text-foreground">{copyright.name}</p>
                            <p className="text-[10px] text-muted-foreground">{(copyright.size / 1024).toFixed(0)} KB</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-bold text-muted-foreground">Click to upload signed copyright form</p>
                            <p className="text-[10px] text-muted-foreground/70">PDF only</p>
                        </>
                    )}
                </div>
            </div>

            {/* Changelog / Cover Letter */}
            <div className="space-y-2">
                <Label htmlFor="changelog" className="text-xs font-bold uppercase tracking-widest text-foreground/80">
                    Response to Reviewers / Cover Letter <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                    id="changelog"
                    name="changelog"
                    placeholder="Summarize the changes made in response to reviewer comments..."
                    className="min-h-[140px] text-sm resize-none border-border/60 focus:border-primary/40 rounded-xl"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-white dark:text-black hover:bg-primary/90 font-black uppercase tracking-widest text-sm rounded-xl shadow"
            >
                {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</span>
                ) : (
                    <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Submit Revision</span>
                )}
            </Button>
        </form>
    );
}
