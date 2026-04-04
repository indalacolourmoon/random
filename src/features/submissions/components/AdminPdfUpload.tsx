'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp, FileCheck, Loader2, Download, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { uploadManuscriptPdf } from "@/actions/submissions";

export default function AdminPdfUpload({ submissionId, currentUrl }: { submissionId: number, currentUrl?: string | null }) {
    const [showUpload, setShowUpload] = useState(!currentUrl);
    const [isUploading, setIsUploading] = useState(false);

    async function handleUpload(formData: FormData) {
        setIsUploading(true);
        try {
            const result = await uploadManuscriptPdf(submissionId, formData);
            if (result.success) {
                toast.success('Manuscript synchronized successfully');
                setShowUpload(false);
                window.location.reload();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to synchronize manuscript');
        } finally {
            setIsUploading(false);
        }
    }

    if (!showUpload && currentUrl) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-3">
                    <Button 
                        asChild 
                        variant="outline" 
                        className="group w-full h-14 gap-3 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 font-black text-xs tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white dark:hover:text-black transition-all cursor-pointer shadow-sm shadow-emerald-500/5"
                    >
                        <a href={currentUrl} download className="flex items-center justify-center w-full">
                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Download Active Asset</span>
                        </a>
                    </Button>
                    <Button
                        onClick={() => setShowUpload(true)}
                        variant="ghost"
                        className="w-full h-11 gap-3 text-muted-foreground hover:text-primary font-black text-[10px] tracking-widest rounded-xl hover:bg-primary/5 transition-all cursor-pointer border border-transparent hover:border-primary/10"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Update Manuscript PDF</span>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form action={handleUpload} className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Upload PDF Manuscript</label>
                    {currentUrl && (
                        <button
                            type="button"
                            onClick={() => setShowUpload(false)}
                            className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                        >
                            <X className="w-3 h-3" /> Cancel
                        </button>
                    )}
                </div>

                <div className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${isUploading ? 'bg-primary/5 border-primary/20 cursor-wait' : 'bg-muted/30 border-primary/10 hover:bg-primary/3 hover:border-primary/30 cursor-pointer'}`}>
                    <input
                        title="pdfFile"
                        name="pdfFile"
                        type="file"
                        accept=".pdf"
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-wait"
                        disabled={isUploading}
                    />
                    
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Synchronizing Archive...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <FileUp className="w-7 h-7 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-[11px] font-black text-primary uppercase tracking-widest">Select Secure PDF</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-40">Manuscript formatting enforced</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                disabled={isUploading}
                className="w-full h-12 gap-3 bg-primary text-white dark:text-black font-black text-xs tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <FileCheck className="w-4 h-4" />
                )}
                <span>Finalize Submission Asset</span>
            </Button>
        </form>
    );
}
