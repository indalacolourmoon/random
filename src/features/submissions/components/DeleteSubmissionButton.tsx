"use client";

import { Trash2, Loader2, AlertTriangle, XCircle } from "lucide-react";
import { deleteSubmissionPermanently } from "@/actions/submissions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteSubmissionButtonProps {
    submissionId: number;
    status?: string;
    variant?: "icon" | "full";
}

export default function DeleteSubmissionButton({ submissionId, status, variant = "icon" }: DeleteSubmissionButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isRestricted = status === 'paid' || status === 'published';

    async function handleDelete() {
        if (isRestricted) {
            setErrorMessage("This submission is marked as paid or published and cannot be deleted from the active registry.");
            setErrorOpen(true);
            return;
        }

        setLoading(true);
        try {
            const res = await deleteSubmissionPermanently(submissionId);
            if (res.success) {
                if (variant === "full") {
                    router.push("/admin/submissions");
                } else {
                    router.refresh();
                }
            } else {
                setErrorMessage(res.error || "Failed to terminate the submission node.");
                setErrorOpen(true);
            }
        } catch (error) {
            setErrorMessage("An architectural error occurred during node termination.");
            setErrorOpen(true);
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    const trigger = variant === "full" ? (
        <Button
            variant="outline"
            disabled={loading || isRestricted}
            className="w-full h-14 gap-3 border-red-500/10 text-red-400 font-black text-xs  tracking-[0.2em] rounded-2xl hover:bg-red-500/5 hover:text-red-600 transition-all  shadow-inner cursor-pointer"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Trash2 className="w-5 h-5" />
            )}
            {isRestricted ? 'Termination Restricted' : 'Terminate Submission'}
        </Button>
    ) : (
        <Button
            variant="ghost"
            size="icon"
            disabled={loading || isRestricted}
            className="w-12 h-12 bg-red-500/5 text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-600 transition-all disabled:opacity-50 shadow-inner cursor-pointer"
            title={isRestricted ? "Termination Restricted" : "Terminate Node"}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Trash2 className="w-5 h-5" />
            )}
        </Button>
    );

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    {trigger}
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] p-8 bg-white border-red-500/10 shadow-2xl">
                    <AlertDialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 shadow-inner mb-2">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-red-600 tracking-widerer ">Critical Termination Protocol</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-medium text-red-900/40 leading-relaxed  tracking-widest ">
                            DANGER: This action will permanently erase this manuscript node and all associated technical dossiers from the global server. This operation is irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6 gap-4">
                        <AlertDialogCancel className="h-14 px-8 rounded-2xl font-black text-[10px]  tracking-widest border-primary/10 text-primary/40 hover:bg-primary/5 cursor-pointer">
                            Abort Protocol
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="h-14 px-8 rounded-2xl bg-red-600 text-white font-black text-[10px]  tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 cursor-pointer"
                        >
                            Authorize Termination
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
                <AlertDialogContent className="rounded-[2.5rem] p-8 bg-white border-primary/5 shadow-2xl">
                    <AlertDialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner mb-2">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-primary tracking-widerer ">Access Restricted</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-medium text-primary/40 leading-relaxed  tracking-widest ">
                            {errorMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <Button onClick={() => setErrorOpen(false)} className="w-full h-14 font-black text-[10px]  tracking-widest shadow-xl shadow-primary/20  rounded-2xl cursor-pointer">
                            Acknowledge
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
