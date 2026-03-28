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
        if (!confirm("Are you sure you want to reject this application?")) return;

        setLoading('rejecting');
        const result = await rejectApplication(id);
        setLoading(null);

        if (result.success) {
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
        <div className="flex gap-2">
            <Button
                onClick={handleReject}
                disabled={!!loading}
                size="sm"
                variant="outline"
                className="h-7 flex-1 rounded-md text-[9px] font-black uppercase tracking-widest border-rose-100 text-rose-600 hover:bg-rose-50"
            >
                {loading === 'rejecting' ? (
                    <div className="w-3 h-3 border-2 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
                ) : (
                    <>Reject <XCircle className="w-3 h-3 ml-1" /></>
                )}
            </Button>
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
        </div>
    );
}
