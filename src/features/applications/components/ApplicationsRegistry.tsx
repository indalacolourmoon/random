'use client';

import React, { useState, useCallback, useMemo, Suspense } from 'react';
import NextImage from 'next/image';
import { List } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, User, Building2, FileText, 
    Briefcase, Download, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useQueryStates, parseAsString } from 'nuqs';
import dayjs from 'dayjs';
import { Drawer } from 'vaul';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";



import { useApplications, useApproveApplication, useRejectApplication } from "@/hooks/queries/useApplications";

// --- Sub-components ---

const ApplicationItemCard = React.memo(({ 
    app, 
    isSelected, 
    onToggle, 
    onInspect 
}: { 
    app: any; 
    isSelected: boolean; 
    onToggle: (id: number) => void;
    onInspect: (app: any) => void;
}) => {
    return (
        <Card 
            className={`relative overflow-hidden border-primary/5 bg-card/50 transition-all hover:bg-card hover:border-primary/20 cursor-pointer group ${isSelected ? 'ring-2 ring-primary/50' : ''}`}
            onClick={() => onInspect(app)}
        >
            <CardContent className="p-0 flex flex-col md:flex-row items-center">
                <div 
                    className="px-6 py-10 flex items-center border-r border-primary/5"
                    onClick={(e) => { e.stopPropagation(); onToggle(app.id); }}
                >
                    <Checkbox checked={isSelected} />
                </div>

                <div className="p-4 flex justify-center shrink-0">
                    <div className="w-20 h-20 bg-muted rounded-xl border border-primary/5 overflow-hidden shadow-inner relative">
                        {app.photoUrl ? (
                            <NextImage 
                                src={app.photoUrl} 
                                alt="" 
                                width={80} 
                                height={80} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20"><User /></div>
                        )}
                    </div>
                </div>

                <div className="p-6 flex-1 space-y-2 border-r border-primary/5 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-foreground truncate uppercase tracking-tight">{app.fullName}</h3>
                        <Badge className={`rounded-lg h-5 px-2.5 border-none text-[8px] font-black uppercase tracking-widest ${
                            app.type === 'editor' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                            {app.type}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60">
                        <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> {app.institute}</span>
                        <span className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> {app.designation}</span>
                    </div>
                </div>

                <div className="p-8 flex flex-col items-center md:items-end justify-center gap-3 bg-muted/5 h-full min-w-[200px]">
                    <Badge className={`h-8 px-5 text-[10px] font-black tracking-widest uppercase border-none rounded-xl ${
                        app.status === 'approved' ? 'bg-emerald-500 text-white' :
                        app.status === 'rejected' ? 'bg-rose-500 text-white' :
                        'bg-amber-500 text-black'
                    }`}>
                        {app.status}
                    </Badge>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">
                        {dayjs(app.createdAt).format('DD MMM YYYY')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
});

ApplicationItemCard.displayName = 'ApplicationItemCard';

// --- Main Registry Component ---

export function ApplicationsRegistry({ role: panelRole }: { role: 'admin' | 'editor' }) {
    const [filters, setFilters] = useQueryStates({
        role: parseAsString.withDefault('all'),
        status: parseAsString.withDefault('all'),
        interest: parseAsString.withDefault('')
    }, { shallow: false, history: 'replace' });

    const { role, status, interest } = filters;

    const { data: applications = [], isLoading: loading } = useApplications({ 
        role: role === 'all' ? undefined : role as any, 
        status: status === 'all' ? undefined : status as any, 
    });

    const approveMutation = useApproveApplication();
    const rejectMutation = useRejectApplication();

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [inspectApp, setInspectApp] = useState<any | null>(null);
    const [rejectionMode, setRejectionMode] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approveConfirm, setApproveConfirm] = useState(false);

    const filteredApps = useMemo(() => {
        if (!interest) return applications;
        const q = interest.toLowerCase();
        return applications.filter(app => 
            app.fullName?.toLowerCase().includes(q) || 
            app.email?.toLowerCase().includes(q) ||
            app.research_interests?.some((i: string) => i.toLowerCase().includes(q))
        );
    }, [applications, interest]);

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) setSelectedIds(filteredApps.map(app => app.id));
        else setSelectedIds([]);
    }, [filteredApps]);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const handleApprove = async (id: number) => {
        const toastId = toast.loading("Processing approval...");
        const res = await approveMutation.mutateAsync(id);
        if (res.success) {
            toast.success("Personnel candidacy authorized", { id: toastId });
            setInspectApp(null);
            setApproveConfirm(false);
        } else {
            toast.error(res.error || "Authorization failed", { id: toastId });
        }
    };

    const handleReject = async (id: number, reason: string) => {
        if (reason.length < 20) {
            toast.error("Vetting rationale must be at least 20 characters");
            return;
        }
        const toastId = toast.loading("Processing rejection...");
        const res = await rejectMutation.mutateAsync({ id, reason });
        if (res.success) {
            toast.success("Proposal declined", { id: toastId });
            setInspectApp(null);
            setRejectionMode(false);
            setRejectionReason("");
        } else {
            toast.error(res.error || "Rejection failed", { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="p-32 flex flex-col items-center justify-center gap-6">
                <div className="w-14 h-14 border-[3px] border-primary/10 border-t-primary rounded-full animate-spin" />
                <p className="font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse text-muted-foreground">Accessing vetting pipeline...</p>
            </div>
        );
    }

    return (
        <section className="space-y-8 pb-32">
            

            <div className="relative group max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search candidates by name or domain..."
                    value={interest}
                    onChange={(e) => setFilters({ interest: e.target.value })}
                    className="h-14 pl-14 bg-primary/5 border-none font-semibold text-sm rounded-2xl focus-visible:ring-4 focus-visible:ring-primary/5"
                />
            </div>

            {filteredApps.length > 0 && (
                <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 rounded-xl border border-primary/5 w-fit">
                    <Checkbox 
                        checked={selectedIds.length === filteredApps.length && filteredApps.length > 0}
                        onCheckedChange={handleSelectAll}
                        id="select-all"
                    />
                    <label htmlFor="select-all" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer">
                        {selectedIds.length === 0 ? "Select for batch action" : `${selectedIds.length} applicants selected`}
                    </label>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {filteredApps.length === 0 ? (
                    <div className="py-32 text-center bg-primary/2 border-2 border-dashed border-primary/10 rounded-2xl space-y-4">
                        <AlertCircle className="w-12 h-12 text-primary/10 mx-auto" />
                        <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">No matching dossiers found</p>
                    </div>
                ) : (
                    <div className="h-[calc(100vh-400px)] min-h-[600px]">
                        <List
                            rowCount={filteredApps.length}
                            rowHeight={160}
                            style={{ height: '100%', width: '100%' }}
                            className="custom-scrollbar"
                            rowProps={{
                                filteredApps,
                                selectedIds,
                                toggleSelect,
                                setInspectApp
                            }}
                            rowComponent={({ index, style, filteredApps, selectedIds, toggleSelect, setInspectApp }: any) => (
                                <div style={style} className="pb-4 pr-4">
                                    <ApplicationItemCard 
                                        app={filteredApps[index]}
                                        isSelected={selectedIds.includes(filteredApps[index].id)}
                                        onToggle={toggleSelect}
                                        onInspect={setInspectApp}
                                    />
                                </div>
                            )}
                        />
                    </div>
                )}
            </div>

            <Drawer.Root open={!!inspectApp} onOpenChange={(o) => { if(!o) { setInspectApp(null); setRejectionMode(false); setApproveConfirm(false); } }}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col h-[90vh] bg-card border-t border-primary/5 rounded-t-[32px] outline-none shadow-2xl">
                        <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-primary/10 my-4" />
                        <div className="flex-1 overflow-y-auto px-6 pb-12 custom-scrollbar">
                            {inspectApp && (
                                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] min-h-full gap-8">
                                    <div className="p-8 bg-primary/2 border rounded-3xl border-primary/5 space-y-8">
                                        <div className="space-y-6 text-center lg:text-left">
                                            <div className="w-40 h-40 rounded-3xl bg-muted border border-primary/5 mx-auto lg:mx-0 overflow-hidden shadow-2xl">
                                                {inspectApp.photoUrl ? (
                                                    <NextImage src={inspectApp.photoUrl} alt="" width={300} height={300} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-20 scale-150"><User /></div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-3xl font-black uppercase tracking-tight">{inspectApp.fullName}</h2>
                                                <p className="text-xs font-black text-primary uppercase tracking-[0.2em] opacity-60">{inspectApp.designation}</p>
                                            </div>
                                        </div>

                                        <Separator className="bg-primary/5" />

                                        <div className="space-y-6">
                                            {[
                                                { label: 'Institution', value: inspectApp.institute },
                                                { label: 'Nationality', value: inspectApp.nationality },
                                                { label: 'Role Target', value: inspectApp.type },
                                                { label: 'Status', value: inspectApp.status, color: inspectApp.status === 'approved' ? 'text-emerald-500' : inspectApp.status === 'rejected' ? 'text-rose-500' : 'text-amber-500' }
                                            ].map(item => (
                                                <div key={item.label} className="space-y-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{item.label}</span>
                                                    <p className={`text-[11px] font-black uppercase tracking-widest ${item.color || 'text-foreground'}`}>{item.value}</p>
                                                </div>
                                            ))}

                                            <div className="space-y-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Core Expertise</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {inspectApp.research_interests?.map((tag: string) => (
                                                        <span key={tag} className="text-[9px] font-black uppercase text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col bg-card border border-primary/5 rounded-3xl overflow-hidden shadow-inner">
                                        <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-primary/2">
                                            <div className="flex items-center gap-4">
                                                <FileText className="text-primary w-5 h-5" />
                                                <span className="font-bold text-xs uppercase tracking-[0.2em]">Candidacy Dossier</span>
                                            </div>
                                            <Button variant="outline" size="sm" asChild className="h-9 px-5 rounded-xl border-primary/10 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                <a href={inspectApp.cvUrl} download>
                                                    <Download className="w-4 h-4 mr-2" /> Download Document
                                                </a>
                                            </Button>
                                        </div>

                                        <div className="flex-1 min-h-[500px] bg-muted/10 relative">
                                            {inspectApp.cvUrl?.toLowerCase().endsWith('.pdf') ? (
                                                <iframe src={inspectApp.cvUrl} title="Preview" className="w-full h-full border-none dark:invert dark:hue-rotate-180" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                                    <FileText className="w-16 h-16 opacity-20" />
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Document format requires local viewing.</p>
                                                    <Button asChild className="rounded-2xl h-14 px-10 bg-primary text-white font-black uppercase tracking-widest">
                                                        <a href={inspectApp.cvUrl} download>Initialize Download</a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {inspectApp.status === 'pending' && (
                                            <div className="p-8 border-t border-primary/5 bg-primary/2">
                                                <AnimatePresence mode="wait">
                                                    {rejectionMode ? (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-end">
                                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Rejection Rationale (Audit Log)</label>
                                                                    <span className={`text-[10px] font-black ${rejectionReason.length < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                        {rejectionReason.length}/20 chars
                                                                    </span>
                                                                </div>
                                                                <textarea
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                    className="w-full h-32 bg-background border-2 border-rose-500/20 rounded-2xl p-4 text-sm focus:border-rose-500 outline-none transition-all resize-none font-medium"
                                                                    placeholder="Describe the grounds for declining this proposal..."
                                                                />
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <Button variant="ghost" onClick={() => setRejectionMode(false)} className="flex-1 h-14 rounded-2xl font-black uppercase">Abort</Button>
                                                                <Button 
                                                                    disabled={rejectionReason.length < 20}
                                                                    onClick={() => handleReject(inspectApp.id, rejectionReason)}
                                                                    className="flex-2 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest"
                                                                >
                                                                    Confirm Terminal Rejection
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ) : approveConfirm ? (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
                                                            <h4 className="text-xl font-black uppercase">Authorize Personnel?</h4>
                                                            <div className="flex gap-4">
                                                                <Button variant="ghost" onClick={() => setApproveConfirm(false)} className="flex-1 h-14 rounded-2xl font-black uppercase">Abort</Button>
                                                                <Button 
                                                                    onClick={() => handleApprove(inspectApp.id)}
                                                                    className="flex-2 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                                                                >
                                                                    Authorize & Invite
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex gap-4">
                                                            <Button 
                                                                variant="outline" 
                                                                onClick={() => setRejectionMode(true)}
                                                                className="flex-1 h-16 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black uppercase"
                                                            >
                                                                Decline Proposal
                                                            </Button>
                                                            <Button 
                                                                onClick={() => setApproveConfirm(true)}
                                                                className="flex-2 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all"
                                                            >
                                                                Authorize Request
                                                            </Button>
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </section>
    );
}

export default function ApplicationsRegistrySuspense(props: any) {
    return (
        <Suspense fallback={<div className="p-32 text-center text-[10px] font-black text-primary/20 tracking-[0.3em] animate-pulse">SYNCHRONIZING VETTING PIPELINE...</div>}>
            <ApplicationsRegistry {...props} />
        </Suspense>
    );
}
