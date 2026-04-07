'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp, FileCheck, Loader2, Download, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { uploadManuscriptPdf, autoSyncManuscriptToPdf } from "@/actions/submissions";

export default function AdminPdfUpload({ submissionId, currentUrl }: { submissionId: number, currentUrl?: string | null }) {
    const [showUpload, setShowUpload] = useState(!currentUrl);
    const [isUploading, setIsUploading] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

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

    async function handleAutoConvert() {
        setIsConverting(true);
        try {
            const result = await autoSyncManuscriptToPdf(submissionId);
            if (result.success) {
                toast.success('PDF generated and synced successfully');
                setShowUpload(false);
                window.location.reload();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Critical error during PDF conversion');
        } finally {
            setIsConverting(false);
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
                        onClick={handleAutoConvert}
                        disabled={isConverting || isUploading}
                        variant="ghost"
                        className="w-full h-11 gap-3 text-primary hover:text-primary font-black text-[10px] tracking-widest rounded-xl hover:bg-primary/5 transition-all cursor-pointer border border-primary/10"
                    >
                        {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        <span>Update using PDF Converter</span>
                    </Button>

                    <Button
                        onClick={() => setShowUpload(true)}
                        variant="ghost"
                        className="w-full h-11 gap-3 text-muted-foreground hover:text-primary font-black text-[10px] tracking-widest rounded-xl hover:bg-primary/5 transition-all cursor-pointer border border-transparent hover:border-primary/10"
                    >
                        <FileUp className="w-4 h-4" />
                        <span>Manual File Override</span>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form action={handleUpload} className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Manuscript Source</label>
                    {currentUrl && (
                        <button
                            type="button"
                            onClick={() => setShowUpload(false)}
                            className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                        >
                            <X className="w-3 h-3" /> Close
                        </button>
                    )}
                </div>

                <Button
                    type="button"
                    onClick={handleAutoConvert}
                    disabled={isConverting || isUploading}
                    variant="outline"
                    className="w-full h-16 gap-4 border-primary/20 bg-primary/5 text-primary font-black text-[11px] tracking-widest rounded-2xl hover:bg-primary hover:text-white dark:hover:text-black transition-all shadow-xl shadow-primary/5 cursor-pointer relative overflow-hidden group"
                >
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-3">
                            {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />}
                            <span>Upload using PDF Converter</span>
                        </div>
                        <span className="text-[8px] opacity-60 font-medium tracking-normal">Direct Docx to PDF Translation</span>
                    </div>
                </Button>

                <div className="relative py-2">
                    <Separator className="bg-border/50" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">or manual upload</span>
                </div>

                <div className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${isUploading ? 'bg-primary/5 border-primary/20 cursor-wait' : 'bg-muted/30 border-primary/10 hover:bg-primary/3 hover:border-primary/30 cursor-pointer'}`}>
                    <input
                        title="pdfFile"
                        name="pdfFile"
                        type="file"
                        accept=".pdf"
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-wait"
                        disabled={isUploading || isConverting}
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
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-40">Manual override only</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                disabled={isUploading || isConverting}
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
