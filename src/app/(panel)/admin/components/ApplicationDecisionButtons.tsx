"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { approveApplication, rejectApplication } from "@/actions/applications";

import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    id: number;
}

export default function ApplicationDecisionButtons({ id }: Props) {
    const [loading, setLoading] = useState<'approving' | 'rejecting' | null>(null);
    const [reason, setReason] = useState("");
    const [showReasonInput, setShowReasonInput] = useState(false);

    async function handleApprove() {
        setLoading('approving');
        const result = await approveApplication(id);
        setLoading(null);

        if (result.success) {
            toast.success("Application Approved", {
                description: "User has been invited via email.",
            });
        } else {
            toast.error("Error", {
                description: result.error,
            });
        }
    }

    async function handleReject() {
        if (!showReasonInput) {
            setShowReasonInput(true);
            return;
        }

        if (reason.trim().length < 20) {
            toast.error("Reason Required", {
                description: "Please provide a rejection reason (min 20 chars).",
            });
            return;
        }

        setLoading('rejecting');
        const result = await rejectApplication(id, reason);
        setLoading(null);

        if (result.success) {
            setShowReasonInput(false);
            setReason("");
            toast.info("Application Rejected", {
                description: "Rejection email has been sent.",
            });
        } else {
            toast.error("Error", {
                description: result.error,
            });
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {showReasonInput && (
                <div className="space-y-2 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <textarea 
                        className="w-full h-20 p-2 text-[10px] bg-muted border border-primary/10 rounded-md focus:ring-1 focus:ring-primary/20 outline-none resize-none font-medium text-foreground placeholder:text-muted-foreground/50"
                        placeholder="Rejection Reason (min 20 characters)..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                         <Button
                            onClick={() => { setShowReasonInput(false); setReason(""); }}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                         >
                            Cancel
                         </Button>
                    </div>
                </div>
            )}
            <div className="flex gap-2">
                <Button
                    onClick={handleReject}
                    disabled={!!loading}
                    size="sm"
                    variant="outline"
                    className={`h-7 flex-1 rounded-md text-[9px] font-black uppercase tracking-widest border-rose-100 transition-all ${showReasonInput ? 'bg-rose-600 text-white hover:bg-rose-700' : 'text-rose-600 hover:bg-rose-50'}`}
                >
                    {loading === 'rejecting' ? (
                        <div className="w-3 h-3 border-2 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
                    ) : (
                        <>{showReasonInput ? 'Confirm Rejection' : 'Reject'} <XCircle className="w-3 h-3 ml-1" /></>
                    )}
                </Button>
                {!showReasonInput && (
                    <Button
                        onClick={handleApprove}
                        disabled={!!loading}
                        size="sm"
                        className="h-7 flex-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        {loading === 'approving' ? (
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Approve <CheckCircle2 className="w-3 h-3 ml-1" /></>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
