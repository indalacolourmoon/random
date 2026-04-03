"use client";

import { useState } from "react";
import { requestResubmissionWithComments } from "@/actions/submissions";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
    submissionId: number;
    paperId: string;
    paperTitle: string;
    requestedBy: string;
}

export function RequestResubmissionModal({ submissionId, paperId, paperTitle, requestedBy }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function handleSubmit() {
        if (comments.trim().length < 20) {
            setError("Please provide meaningful feedback (at least 20 characters).");
            return;
        }
        setError(null);
        setLoading(true);
        const result = await requestResubmissionWithComments(submissionId, comments, requestedBy);
        setLoading(false);
        if (result.error) {
            setError(result.error);
        } else {
            setDone(true);
            setTimeout(() => {
                setOpen(false);
                setDone(false);
                setComments("");
                router.refresh();
            }, 2000);
        }
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                size="sm"
                className="h-9 text-xs font-bold uppercase rounded-xl border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-500/30 dark:text-orange-400 dark:hover:bg-orange-500/10 transition-all"
            >
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Request Resubmission
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-black uppercase tracking-widest text-foreground">Request Revision</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Your feedback will be emailed to the author with a link to their Author Portal.
                        </DialogDescription>
                    </DialogHeader>

                    {done ? (
                        <div className="py-10 flex flex-col items-center gap-3 text-center">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                            <p className="font-bold text-foreground uppercase tracking-wider text-sm">Revision Requested</p>
                            <p className="text-xs text-muted-foreground">Author has been notified via email.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 py-2">
                                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1">
                                    <p className="font-bold text-foreground">{paperTitle}</p>
                                    <Badge variant="outline" className="text-[9px] font-mono">{paperId}</Badge>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest">
                                        Reviewer Comments / Required Changes <span className="text-rose-500">*</span>
                                    </Label>
                                    <Textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Describe the required revisions, specific sections to address, formatting issues, missing references, etc."
                                        className="min-h-[150px] text-sm resize-none rounded-xl border-border/60 focus:border-primary/40"
                                    />
                                    <p className="text-[10px] text-muted-foreground">{comments.length} characters (min. 20)</p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 text-xs font-medium">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px]">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    The author will have <strong>15 days</strong> to resubmit. If they don't act, their account will be auto-deactivated.
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold uppercase text-xs">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase text-xs rounded-xl"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
