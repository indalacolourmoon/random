"use client";

export const dynamic = "force-dynamic";

import { useApplications, useApproveApplication, useRejectApplication } from '@/hooks/queries/useApplications';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
    User,
    FileText,
    Mail,
    Building2,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Search,
    Filter,
    Clock,
    UserCheck,
    Briefcase,
    MoreVertical,
    CheckCircle,
    X,
    AlertTriangle,
    Download,
    Trash2,
    RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Suspense } from 'react';


function ManageApplicationsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // URL Filter State
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const interest = searchParams.get('interest') || '';

    const { data: applications = [], isLoading: loading } = useApplications({ 
        role, 
        status, 
        interest 
    });

    const approveMutation = useApproveApplication();
    const rejectMutation = useRejectApplication();

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [inspectApp, setInspectApp] = useState<any | null>(null);
    const [rejectionMode, setRejectionMode] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approveConfirm, setApproveConfirm] = useState(false);
    
    // Bulk state
    const [bulkMode, setBulkMode] = useState<'approve' | 'reject' | null>(null);
    const [bulkReason, setBulkReason] = useState("");

    const updateFilters = (newFilters: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === 'all' || !value) params.delete(key);
            else params.set(key, value);
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push(pathname);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(applications.map(app => app.id));
        else setSelectedIds([]);
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleApprove = async (id: number) => {
        const toastId = toast.loading("Processing approval...");
        try {
            const res = await approveMutation.mutateAsync(id);
            if (res.success) {
                toast.success("Application approved and user invited", { id: toastId });
                setInspectApp(null);
                setApproveConfirm(false);
            } else {
                toast.error(res.error || "Approval failed", { id: toastId });
            }
        } catch (e) {
            toast.error("Internal service error", { id: toastId });
        }
    };

    const handleReject = async (id: number, reason: string) => {
        if (reason.length < 20) {
            toast.error("Rejection reason must be at least 20 characters");
            return;
        }
        const toastId = toast.loading("Processing rejection...");
        try {
            const res = await rejectMutation.mutateAsync({ id, reason });
            if (res.success) {
                toast.success("Application rejected", { id: toastId });
                setInspectApp(null);
                setRejectionMode(false);
                setRejectionReason("");
            } else {
                toast.error(res.error || "Rejection failed", { id: toastId });
            }
        } catch (e) {
            toast.error("Internal service error", { id: toastId });
        }
    };

    return (
        <section className="space-y-8 pb-32">
            {/* Header Area */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-8 backdrop-blur-sm sticky top-0 z-10 py-4 bg-background/80">
                <div className="space-y-0.5 2xl:space-y-1">
                    <h1 className="font-serif text-2xl xl:text-3xl 2xl:text-4xl font-semibold tracking-tight text-foreground capitalize">Reviewer archive</h1>
                    <p className="text-[9px] xl:text-xs 2xl:text-sm font-medium text-muted-foreground capitalize tracking-widest opacity-60">Professional vetting & onboarding command</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Role Filter */}
                    <div className="flex bg-muted/30 p-1 rounded-full border border-white/5">
                        {['all', 'reviewer', 'editor'].map((r) => (
                            <Button
                                key={r}
                                variant={role === r ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => updateFilters({ role: r })}
                                className={`rounded-full px-5 text-[10px] 2xl:text-sm font-semibold uppercase tracking-tighter h-8 2xl:h-10 ${role === r ? 'shadow-lg shadow-black/20' : 'text-muted-foreground'}`}
                            >
                                {r}
                            </Button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-muted/30 p-1 rounded-full border border-white/5">
                        {['all', 'pending', 'approved', 'rejected'].map((s) => (
                            <Button
                                key={s}
                                variant={status === s ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => updateFilters({ status: s })}
                                className={`rounded-full px-5 text-[10px] 2xl:text-sm font-semibold uppercase tracking-tighter h-8 2xl:h-10 ${status === s ? 'shadow-lg shadow-black/20' : 'text-muted-foreground'}`}
                            >
                                {s}
                            </Button>
                        ))}
                    </div>

                    {(role !== 'all' || status !== 'all' || interest) && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters}
                            className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 text-[10px] font-semibold uppercase"
                        >
                            <RotateCcw className="w-3 h-3 mr-2" /> Clear Filters
                        </Button>
                    )}
                </div>
            </header>

            {/* Interest Search */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search by Research Domain (e.g. VLSI, AI, Signal...)"
                    value={interest}
                    onChange={(e) => updateFilters({ interest: e.target.value })}
                    className="h-14 2xl:h-16 pl-14 bg-muted/10 border-white/5 font-semibold text-sm rounded-2xl focus-visible:ring-primary/20"
                />
            </div>

            {/* Selection Toolbar */}
            {applications.length > 0 && (
                <div className="flex items-center gap-4 px-4 py-2 bg-muted/20 rounded-xl border border-white/5 w-fit">
                    <Checkbox 
                        checked={selectedIds.length === applications.length && applications.length > 0}
                        onCheckedChange={handleSelectAll}
                        id="select-all"
                    />
                    <label htmlFor="select-all" className="text-[9px] xl:text-xs font-semibold text-muted-foreground capitalize cursor-pointer">
                        {selectedIds.length === 0 ? "Select items for batch action" : `${selectedIds.length} applicants selected`}
                    </label>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">Decrypting Archive...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <Card className="border-dashed h-64 flex flex-col items-center justify-center bg-transparent border-white/5 opacity-50">
                        <XCircle className="w-10 h-10 mb-4 text-muted-foreground" />
                        <p className="font-mono text-[10px] uppercase">No matching dossiers found in sector</p>
                    </Card>
                ) : (
                    <AnimatePresence>
                        {applications.map((app) => (
                            <motion.div
                                key={app.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative"
                            >
                                <Card 
                                    className={`relative overflow-hidden border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all hover:bg-white/[0.04] hover:border-primary/30 cursor-pointer ${selectedIds.includes(app.id) ? 'border-primary/50' : ''}`}
                                    onClick={() => setInspectApp(app)}
                                >
                                    <div className="flex items-stretch">
                                        {/* Selection Area */}
                                        <div 
                                            className="px-6 flex items-center border-r border-white/5"
                                            onClick={(e) => { e.stopPropagation(); toggleSelect(app.id); }}
                                        >
                                            <Checkbox checked={selectedIds.includes(app.id)} />
                                        </div>

                                        <CardContent className="p-0 flex-1 grid grid-cols-1 md:grid-cols-[120px_1fr_250px] items-center">
                                            {/* Photo */}
                                            <div className="p-4 flex justify-center">
                                                <div className="w-16 h-16 2xl:w-20 2xl:h-20 bg-muted rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                                                    {app.photo_url ? (
                                                        <img src={app.photo_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center opacity-20"><User /></div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-6 space-y-2 border-r border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-serif text-lg xl:text-xl 2xl:text-2xl font-semibold text-foreground">{app.full_name}</h3>
                                                    <Badge className={`rounded-full h-5 px-3 border-none text-[8px] xl:text-[9px] font-semibold capitalize tracking-widest ${
                                                        app.application_type === 'editor' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                                    }`}>
                                                        {app.application_type}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground text-[9px] xl:text-xs font-semibold capitalize tracking-wide opacity-70">
                                                    <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> {app.institute}</span>
                                                    <span className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> {app.designation}</span>
                                                    <span className="flex items-center gap-2 underline decoration-primary/20"><Mail className="w-3.5 h-3.5" /> {app.email}</span>
                                                </div>
                                                
                                                {/* Domain Tags */}
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {app.research_interests?.map((tag: string) => (
                                                        <span key={tag} className="text-[8px] xl:text-[9px] font-semibold capitalize text-primary px-2 py-0.5 bg-primary/5 rounded-md border border-primary/10">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Status & Meta */}
                                            <div className="p-8 flex flex-col items-center md:items-end justify-center gap-4 bg-muted/10 h-full">
                                                <Badge className={`h-8 px-6 text-xs font-semibold tracking-widest uppercase border-none rounded-xl ${
                                                    app.status === 'approved' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' :
                                                    app.status === 'rejected' ? 'bg-rose-700 text-white shadow-lg shadow-rose-700/30' :
                                                    'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                                                }`}>
                                                    {app.status}
                                                </Badge>
                                                <p className="text-[9px] font-mono text-muted-foreground uppercase opacity-40">
                                                    Logged: {new Date(app.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Sticky Batch Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
                    >
                        <Card className="bg-black/80 backdrop-blur-2xl border-white/20 p-6 shadow-2xl rounded-3xl ring-4 ring-black/50">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-serif text-lg font-semibold text-white">{selectedIds.length} Candidates</span>
                                    <span className="text-[9px] font-mono uppercase text-muted-foreground">Multiple Batch Operations Active</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="text-white opacity-50 hover:opacity-100">
                                        Deselect All
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setBulkMode('reject')}
                                        className="bg-rose-900/20 border-rose-500/50 text-rose-500 hover:bg-rose-500 hover:text-white font-semibold"
                                    >
                                        Batch Reject
                                    </Button>
                                    <Button 
                                        onClick={() => setBulkMode('approve')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                    >
                                        Batch Approve
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inspect Modal */}
            <Dialog open={!!inspectApp} onOpenChange={(o) => { if(!o) { setInspectApp(null); setRejectionMode(false); setApproveConfirm(false); } }}>
                <DialogContent className="max-w-6xl w-[95vw] p-0 border-white/10 bg-black overflow-hidden rounded-3xl">
                    {inspectApp && (
                        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] h-[80vh]">
                            {/* Profile Panel */}
                            <div className="p-10 bg-muted/10 border-r border-white/5 space-y-8 overflow-y-auto custom-scrollbar">
                                <div className="space-y-6 text-center lg:text-left">
                                    <div className="w-40 h-40 2xl:w-48 2xl:h-48 rounded-3xl bg-muted border border-white/10 mx-auto lg:mx-0 overflow-hidden shadow-2xl ring-1 ring-white/5">
                                        {inspectApp.photo_url ? (
                                            <img src={inspectApp.photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-20 scale-150"><User /></div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="font-serif text-3xl 2xl:text-4xl font-semibold">{inspectApp.full_name}</h2>
                                        <p className="font-mono text-xs text-primary uppercase tracking-widest">{inspectApp.designation}</p>
                                    </div>
                                </div>

                                <Separator className="bg-white/5" />

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                        <div className="space-y-1">
                                            <span className="opacity-40">Institution</span>
                                            <p className="text-[11px] text-foreground font-semibold">{inspectApp.institute}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="opacity-40">Nationality</span>
                                            <p className="text-[11px] text-foreground font-semibold">{inspectApp.nationality}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="opacity-40">Role Target</span>
                                            <p className="text-[11px] text-foreground font-semibold">{inspectApp.application_type}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="opacity-40">Status</span>
                                            <p className={`text-[11px] font-semibold ${
                                                 inspectApp.status === 'approved' ? 'text-emerald-500' : 
                                                 inspectApp.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'
                                            }`}>{inspectApp.status}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground opacity-40">Expertise Tags</span>
                                        <div className="flex flex-wrap gap-2">
                                            {inspectApp.research_interests?.map((tag: string) => (
                                                <span key={tag} className="text-[9px] font-semibold uppercase text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {inspectApp.status === 'rejected' && inspectApp.rejection_reason && (
                                        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-2">
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-rose-500">Rejection Reasoning</span>
                                            <p className="text-xs text-rose-200/60 leading-relaxed italic">"{inspectApp.rejection_reason}"</p>
                                        </div>
                                    )}

                                    {inspectApp.reviewed_at && (
                                         <div className="pt-8 opacity-40 text-[8px] font-mono uppercase tracking-[0.2em] leading-loose">
                                            Audited At: {new Date(inspectApp.reviewed_at).toLocaleString()}
                                            <br />
                                            Auditor ID: 0000{inspectApp.reviewed_by}
                                         </div>
                                    )}
                                </div>
                            </div>

                            {/* Verification Panel */}
                            <div className="flex flex-col bg-background">
                                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <FileText className="text-primary w-5 h-5" />
                                        <span className="font-semibold text-xs uppercase tracking-widest">Research Dossier</span>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="h-8 rounded-lg border border-white/5 px-4 text-[10px] font-semibold uppercase">
                                        <a href={inspectApp.cv_url} download>
                                            <Download className="w-3.5 h-3.5 mr-2" /> Download Original
                                        </a>
                                    </Button>
                                </div>

                                <div className="flex-1 bg-muted/20 relative">
                                    {inspectApp.cv_url?.toLowerCase().endsWith('.pdf') ? (
                                        <iframe 
                                            src={inspectApp.cv_url} 
                                            title="Candidate CV Preview"
                                            className="w-full h-full border-none grayscale contrast-125"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                            <div className="p-8 bg-muted rounded-full border border-white/5 opacity-40">
                                                <FileText className="w-16 h-16" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-serif text-2xl font-semibold">Incompatible Preview</h4>
                                                <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60">Non-PDF Research Documentation Detected</p>
                                            </div>
                                            <Button asChild className="rounded-2xl h-14 px-8 bg-white text-black font-semibold hover:bg-white/90">
                                                <a href={inspectApp.cv_url} download>
                                                    Retrieve & Download Document
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Footer */}
                                {inspectApp.status === 'pending' && (
                                    <div className="p-8 border-t border-white/5 bg-muted/5">
                                        <AnimatePresence mode="wait">
                                            {rejectionMode ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-end">
                                                            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mandatory Vetting Reason (Audit Log)</label>
                                                            <span className={`text-[10px] font-mono ${rejectionReason.length < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                {rejectionReason.length}/20 min
                                                            </span>
                                                        </div>
                                                        <textarea
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            placeholder="State the academic grounds for rejection... (Minimum 20 characters required)"
                                                            className="w-full h-32 bg-black border border-rose-500/30 rounded-2xl p-4 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <Button 
                                                            variant="ghost" 
                                                            onClick={() => setRejectionMode(false)}
                                                            className="flex-1 h-14 rounded-2xl font-semibold uppercase tracking-widest"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button 
                                                            disabled={rejectionReason.length < 20}
                                                            onClick={() => handleReject(inspectApp.id, rejectionReason)}
                                                            className="flex-[2] h-14 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-semibold uppercase tracking-widest shadow-xl shadow-rose-900/40"
                                                        >
                                                            Confirm Terminal Rejection
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ) : approveConfirm ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="space-y-6 text-center"
                                                >
                                                    <div className="space-y-2">
                                                        <h4 className="font-serif text-xl font-semibold">Proceed with Onboarding?</h4>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60">
                                                            Approving {inspectApp.full_name} as {inspectApp.application_type}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <Button 
                                                            variant="ghost" 
                                                            onClick={() => setApproveConfirm(false)}
                                                            className="flex-1 h-14 rounded-2xl font-semibold uppercase tracking-widest"
                                                        >
                                                            Abort
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleApprove(inspectApp.id)}
                                                            className="flex-[2] h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase tracking-widest shadow-xl shadow-emerald-900/40"
                                                        >
                                                            Confirm Approval & Invite
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="flex gap-4">
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={() => setRejectionMode(true)}
                                                        className="flex-1 h-16 rounded-2xl border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white font-semibold uppercase tracking-widest"
                                                    >
                                                        Reject Candidate
                                                    </Button>
                                                    <Button 
                                                        onClick={() => setApproveConfirm(true)}
                                                        className="flex-[2] h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase tracking-widest shadow-xl shadow-emerald-900/40"
                                                    >
                                                        Approve Request
                                                    </Button>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Bulk Confirmation Modals */}
            <Dialog open={bulkMode === 'approve'} onOpenChange={() => setBulkMode(null)}>
                <DialogContent className="max-w-md bg-black border-white/10 p-8 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-semibold">Batch Onboarding</DialogTitle>
                        <DialogDescription className="font-mono text-[10px] uppercase tracking-widest py-2">
                            Awaiting confirmation for {selectedIds.length} candidate profiles.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <p className="text-xs text-white/60 leading-relaxed">
                                This action will atomically create professional user profiles for all selected candidates and broadcast formal invitation protocols.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-4">
                        <Button variant="ghost" onClick={() => setBulkMode(null)} className="font-semibold uppercase h-14 rounded-2xl flex-1">Abort</Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase h-14 rounded-2xl flex-[2]"
                            onClick={() => {
                                toast.promise(
                                    // Use individual approval for simplicity or a dedicated batch action if built
                                    Promise.all(selectedIds.map(id => handleApprove(id))),
                                    {
                                        loading: 'Executing batch onboarding...',
                                        success: 'Batch complete. Selection cleared.',
                                        error: 'Partial failure in batch operation'
                                    }
                                );
                                setSelectedIds([]);
                                setBulkMode(null);
                            }}
                        >
                            Execute Batch Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={bulkMode === 'reject'} onOpenChange={() => setBulkMode(null)}>
                <DialogContent className="max-w-md bg-black border-white/10 p-8 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-semibold">Terminal Batch Rejection</DialogTitle>
                        <DialogDescription className="font-mono text-[10px] uppercase tracking-widest py-2">
                            Shared reasoning protocol for {selectedIds.length} profiles.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Audit Reason (Bulk Applied)</label>
                                <span className={`text-[10px] font-mono ${bulkReason.length < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {bulkReason.length}/20 min
                                </span>
                            </div>
                            <textarea
                                value={bulkReason}
                                onChange={(e) => setBulkReason(e.target.value)}
                                placeholder="Explain basic rejection grounds for this cohort..."
                                className="w-full h-32 bg-muted/10 border border-rose-500/30 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-rose-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex gap-4">
                        <Button variant="ghost" onClick={() => setBulkMode(null)} className="font-semibold uppercase h-14 rounded-2xl flex-1">Abort</Button>
                        <Button 
                            disabled={bulkReason.length < 20}
                            className="bg-rose-700 hover:bg-rose-800 text-white font-semibold uppercase h-14 rounded-2xl flex-[2]"
                            onClick={() => {
                                toast.promise(
                                    Promise.all(selectedIds.map(id => handleReject(id, bulkReason))),
                                    {
                                        loading: 'Executing terminal batch...',
                                        success: 'Batch rejection finalized.',
                                        error: 'Partial failure in batch operation'
                                    }
                                );
                                setSelectedIds([]);
                                setBulkMode(null);
                                setBulkReason("");
                            }}
                        >
                            Confirm Batch Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </section>
    );
}

export default function ManageApplicationsPage() {
    return (
        <Suspense fallback={
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                <p className="font-mono text-[10px] tracking-[0.2em] animate-pulse uppercase">Initializing Interface Architecture...</p>
            </div>
        }>
            <ManageApplicationsContent />
        </Suspense>
    );
}
