"use client";

import React, { useState } from 'react';
import { 
    Plus, BookOpen, Clock, CheckCircle2, Trash2, Globe, Calendar, Layers, 
    CheckCircle, Save, ChevronDown as ChevronDownIcon, ChevronUp, FileText, Eye, Unlink 
} from 'lucide-react';
import {
    useVolumesIssues,
    usePapersByIssue,
    useCreateVolumeIssue,
    useUpdateVolumeIssue,
    useDeleteVolumeIssue,
    usePublishIssue,
    useUnassignPaper
} from '@/hooks/queries/usePublications';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

interface PublicationsRegistryProps {
    role: 'admin' | 'editor';
}

export function PublicationsRegistry({ role }: PublicationsRegistryProps) {
    const { data: volumes = [], isLoading: loading } = useVolumesIssues();
    const createMutation = useCreateVolumeIssue();
    const updateMutation = useUpdateVolumeIssue();
    const deleteMutation = useDeleteVolumeIssue();
    const publishMutation = usePublishIssue();
    const unassignMutation = useUnassignPaper();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState<any>(null);
    const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: issuePapers = [], isLoading: loadingPapers } = usePapersByIssue(expandedIssue);

    async function handleCreate(formData: FormData) {
        setIsSubmitting(true);
        toast.promise(
            createMutation.mutateAsync(formData).then((res) => {
                if (!res.success) throw new Error(res.error || "Failed to initialize cycle");
                return res;
            }),
            {
                loading: 'Deploying publication cycle...',
                success: () => { setShowCreateModal(false); return 'Publication cycle initialized'; },
                error: (err) => err.message,
            }
        );
        setIsSubmitting(false);
    }

    async function handlePublish(id: number) {
        if (!confirm('Are you sure you want to PUBLISH this issue? This will also update the status of all assigned papers.')) return;
        toast.promise(
            publishMutation.mutateAsync(id).then((res) => {
                if (!res.success) throw new Error(res.error || "Failed to publish issue");
                return res;
            }),
            {
                loading: 'Publishing issue & updating all manuscripts...',
                success: 'Issue published successfully',
                error: (err) => err.message,
            }
        );
    }

    function toggleExpand(id: number) {
        if (role !== 'admin') return; // Only admin can expand for now based on previous logic
        setExpandedIssue(expandedIssue === id ? null : id);
    }

    async function handleUnassign(paperId: number) {
        if (!confirm('Unlink this paper from this issue? Its status will revert to "Paid".')) return;
        toast.promise(
            unassignMutation.mutateAsync(paperId).then((res) => {
                if (!res.success) throw new Error(res.error || "Failed to unassign paper");
                return res;
            }),
            {
                loading: 'Unlinking paper from issue...',
                success: 'Paper unassigned successfully',
                error: (err) => err.message,
            }
        );
    }

    async function handleEdit(formData: FormData) {
        if (!showEditModal) return;
        setIsSubmitting(true);
        toast.promise(
            updateMutation.mutateAsync({ id: showEditModal.id, formData }).then((res) => {
                if (!res.success) throw new Error(res.error || "Failed to update metadata");
                return res;
            }),
            {
                loading: 'Committing parameter updates...',
                success: () => { setShowEditModal(null); return 'Metadata updated successfully'; },
                error: (err) => err.message,
            }
        );
        setIsSubmitting(false);
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this issue? All assigned papers will be unlinked and reverted to "Paid" status.')) return;
        toast.promise(
            deleteMutation.mutateAsync(id).then((res) => {
                if (!res.success) throw new Error(res.error || "Failed to delete issue");
                return res;
            }),
            {
                loading: 'Removing publication cycle...',
                success: 'Issue deleted successfully',
                error: (err) => err.message,
            }
        );
    }

    const stats = {
        totalVolumes: new Set(volumes.map(v => v.volumeNumber)).size,
        publishedIssues: volumes.filter(v => v.status === 'published').length,
        openIssues: volumes.filter(v => v.status === 'open').length,
        totalPapers: volumes.reduce((acc, v) => acc + (v.paperCount || 0), 0)
    };

    if (loading) {
        return (
            <div className="p-32 text-center space-y-6">
                <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-black text-primary/40 tracking-[0.4em] text-xs animate-pulse uppercase">Syncing Publication Registry...</p>
            </div>
        );
    }

    return (
        <section className="space-y-12 pb-24 max-w-7xl 2xl:max-w-[1900px] mx-auto overflow-visible">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border/50 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 2xl:w-20 2xl:h-20 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20 shadow-sm">
                            <BookOpen className="w-6 h-6 2xl:w-10 2xl:h-10 text-secondary" />
                        </div>
                        <h1 className="font-serif font-black text-primary tracking-tight text-3xl xl:text-4xl 2xl:text-6xl">
                            Journal Archives
                        </h1>
                    </div>
                    <p className="text-sm 2xl:text-2xl font-medium text-muted-foreground border-l-4 border-secondary/30 pl-6 py-1 max-w-2xl leading-relaxed">
                        {role === 'admin' ? 'Orchestrate global publication schedule and archival cycles.' : 'Manage journal publication schedule and editorial cycles.'}
                    </p>
                </div>

                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="h-14 2xl:h-20 px-12 2xl:px-20 gap-4 bg-secondary text-white dark:text-black font-black text-[10px] 2xl:text-2xl tracking-[0.3em] rounded-2xl 2xl:rounded-3xl shadow-2xl shadow-secondary/20 hover:scale-[1.02] transition-all cursor-pointer border-t border-white/20">
                            <Plus className="w-6 h-6 2xl:w-10 2xl:h-10" /> Deploy New Cycle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-4xl p-10 bg-card border-primary/5 shadow-3xl overflow-hidden glassmorphism">
                        <DialogHeader className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-inner">
                                <Plus className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-3xl font-black text-foreground tracking-tight uppercase italic">Initialize Hub</DialogTitle>
                                <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed tracking-widest uppercase opacity-60">
                                    Define a new volume or issue for manuscript aggregation.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-6 pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase italic">Volume Number</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-base shadow-inner rounded-2xl px-6"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase italic">Issue Number</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-base shadow-inner rounded-2xl px-6"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase italic">Publication Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={new Date().getFullYear()}
                                    className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-base shadow-inner rounded-2xl px-6"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase italic">Cycle Duration</Label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    placeholder="e.g. Jan - Mar"
                                    className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-base shadow-inner rounded-2xl px-6"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-16 bg-secondary text-white dark:text-black font-black text-xs tracking-[0.2em] shadow-2xl shadow-secondary/20 hover:scale-[1.02] transition-all rounded-2xl cursor-pointer uppercase border-t border-white/20">
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Commit Publication Node'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            {/* Publication Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Volumes', value: stats.totalVolumes, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
                    { label: 'Published Issues', value: stats.publishedIssues, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                    { label: 'Open Cycles', value: stats.openIssues, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-500/10' },
                    { label: 'Papers Indexed', value: stats.totalPapers, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                ].map((item, idx) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-card rounded-2xl shadow-sm border border-border/50 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] 2xl:text-sm font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                <h3 className="text-3xl 2xl:text-5xl font-extrabold text-foreground tracking-tight">{item.value}</h3>
                            </div>
                            <div className={`w-14 h-14 2xl:w-20 2xl:h-20 rounded-xl ${item.bg} flex items-center justify-center border border-border/10 shadow-sm group-hover:rotate-6 transition-transform duration-500`}>
                                <item.icon className={`w-6 h-6 2xl:w-10 2xl:h-10 ${item.color}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>


            {/* Grid of Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-14">
                {volumes.map((v, idx) => (
                    <motion.div
                        key={v.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden bg-card rounded-2xl border-t-4 border-t-transparent hover:border-t-secondary/40">
                            <CardContent className="p-0">
                                <div className="p-10 xl:p-14 space-y-8">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] 2xl:text-base font-bold text-muted-foreground tracking-widest uppercase">Archive Node {v.volumeNumber}</p>
                                                {role === 'admin' && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <button title='Edit Metadata' onClick={() => setShowEditModal(v)} className="p-2 2xl:p-4 text-primary hover:text-secondary transition-colors hover:bg-secondary/10 rounded-xl">
                                                            <Save className="w-4 h-4 2xl:w-8 2xl:h-8" />
                                                        </button>
                                                        <button title='Remove Node' onClick={() => handleDelete(v.id)} className="p-2 2xl:p-4 text-rose-500 hover:bg-rose-500/10 rounded-xl">
                                                            <Trash2 className="w-4 h-4 2xl:w-8 2xl:h-8" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-serif font-black text-foreground tracking-tight leading-none text-2xl xl:text-3xl 2xl:text-5xl">
                                                Issue <span className="text-primary">{v.issueNumber}</span>
                                            </h3>
                                        </div>
                                        <Badge className={`h-10 2xl:h-14 px-5 2xl:px-8 text-[10px] 2xl:text-lg font-bold tracking-tight border-none rounded-xl shadow-lg uppercase ${v.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                            {v.status === 'published' ? (
                                                <span className="flex items-center gap-3"><Globe className="w-5 h-5 2xl:w-8 2xl:h-8" /> Published</span>
                                            ) : (
                                                <span className="flex items-center gap-3"><Clock className="w-5 h-5 2xl:w-8 2xl:h-8" /> Open</span>
                                            )}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 2xl:gap-10">
                                        <div className="bg-muted/50 p-6 2xl:p-10 rounded-2xl border border-border/50 group-hover:bg-muted transition-colors">
                                            <Calendar className="w-6 h-6 2xl:w-10 2xl:h-10 text-primary mb-4" />
                                            <p className="text-[10px] 2xl:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Year</p>
                                            <p className="text-xl 2xl:text-4xl font-extrabold text-foreground tracking-tight">{v.year}</p>
                                        </div>
                                        <div className="bg-muted/50 p-6 2xl:p-10 rounded-2xl border border-border/50 group-hover:bg-muted transition-colors">
                                            <Layers className="w-6 h-6 2xl:w-10 2xl:h-10 text-primary mb-4" />
                                            <p className="text-[10px] 2xl:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Duration</p>
                                            <p className="text-xl 2xl:text-3xl font-extrabold text-foreground truncate tracking-tight uppercase">{v.monthRange}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 2xl:space-y-8">
                                        {role === 'admin' ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleExpand(v.id)}
                                                className="w-full h-14 2xl:h-24 gap-4 2xl:gap-6 border-primary/10 text-primary font-black text-[10px] 2xl:text-2xl tracking-[0.3em] rounded-[2rem] hover:bg-primary hover:text-white shadow-xl shadow-primary/5 uppercase transition-all duration-300"
                                            >
                                                {expandedIssue === v.id ? <ChevronUp className="w-6 h-6 2xl:w-10 2xl:h-10" /> : <ChevronDownIcon className="w-6 h-6 2xl:w-10 2xl:h-10" />}
                                                {expandedIssue === v.id ? 'Collapse Dossier' : `Access Manuscripts (${v.paperCount || 0})`}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full h-14 border-primary/10 text-primary font-black text-[10px] tracking-[0.3em] rounded-2xl cursor-default uppercase opacity-50"
                                            >
                                                {v.paperCount || 0} Manuscripts Linked
                                            </Button>
                                        )}

                                        <AnimatePresence>
                                            {expandedIssue === v.id && role === 'admin' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-primary/2 rounded-[2rem] border border-primary/10 shadow-inner"
                                                >
                                                    <div className="p-6 xl:p-10 space-y-4">
                                                        {loadingPapers ? (
                                                            <div className="py-12 text-center">
                                                                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
                                                            </div>
                                                        ) : issuePapers.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {issuePapers.map((paper) => (
                                                                    <div key={paper.id} className="p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-primary/5 shadow-sm space-y-3 group/paper relative overflow-hidden transition-all hover:border-secondary/20">
                                                                        <div className="absolute top-0 left-0 w-1 h-full bg-secondary/10 group-hover/paper:bg-secondary/40 transition-colors" />
                                                                        <div className="flex items-start justify-between gap-6 relative z-10">
                                                                            <div className="min-w-0 space-y-1">
                                                                                <p className="text-xs 2xl:text-xl font-black text-primary tracking-tight leading-tight line-clamp-2 uppercase italic">{paper.title}</p>
                                                                                <p className="text-[10px] 2xl:text-base font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-40">Registry: {paper.paperId}</p>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 shrink-0">
                                                                                <Button asChild variant="ghost" size="icon" className="w-10 h-10 2xl:w-16 2xl:h-16 text-primary/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer">
                                                                                    <a title='Inspect Manuscript' href={`/admin/submissions/${paper.id}`} target="_blank">
                                                                                        <Eye className="w-5 h-5 2xl:w-8 2xl:h-8" />
                                                                                    </a>
                                                                                </Button>
                                                                                <Button title='Unlink from Node' onClick={() => handleUnassign(paper.id)} variant="ghost" size="icon" className="w-10 h-10 2xl:w-16 2xl:h-16 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                                                                    <Unlink className="w-5 h-5 2xl:w-8 2xl:h-8" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="py-20 text-center space-y-4">
                                                                <FileText className="w-12 h-12 2xl:w-20 2xl:h-20 text-primary/10 mx-auto" />
                                                                <p className="text-[10px] 2xl:text-xl font-black text-primary/20 tracking-[0.4em] uppercase">No Manuscripts Indexed</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {v.status === 'open' ? (
                                            <Button
                                                onClick={() => handlePublish(v.id)}
                                                className="w-full h-16 2xl:h-28 gap-4 bg-secondary text-white font-bold text-xs 2xl:text-2xl tracking-widest shadow-xl shadow-secondary/10 rounded-xl hover:bg-emerald-600 transition-all uppercase active:scale-[0.98]"
                                            >
                                                <CheckCircle className="w-6 h-6 2xl:w-10 2xl:h-10" /> Publish Issue
                                            </Button>
                                        ) : (
                                            <div className="w-full h-16 2xl:h-28 bg-emerald-500/5 text-emerald-600 rounded-xl font-bold text-xs 2xl:text-2xl tracking-widest flex items-center justify-center gap-4 border border-emerald-500/20 shadow-inner uppercase">
                                                <Globe className="w-6 h-6 2xl:w-12 2xl:h-12" /> Permanently Published
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {volumes.length === 0 && (
                    <div className="col-span-full py-60 bg-primary/2 border-2 border-dashed border-primary/10 rounded-[4rem] flex flex-col items-center justify-center text-center shadow-inner space-y-10 group hover:bg-primary/4 transition-colors">
                        <div className="w-32 h-32 2xl:w-48 2xl:h-48 rounded-[2.5rem] bg-card border border-primary/10 flex items-center justify-center text-primary/10 shadow-2xl group-hover:scale-110 transition-transform">
                            <BookOpen className="w-16 h-16 2xl:w-24 2xl:h-24" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-serif font-black text-primary/40 tracking-tight uppercase text-3xl xl:text-4xl 2xl:text-6xl leading-none italic">Global Vault Offline</h3>
                            <p className="text-xs 2xl:text-2xl font-bold text-primary/20 tracking-widest max-w-2xl leading-relaxed uppercase mx-auto px-10">No publication cycles detected in the primary registry. Initialize the first volume to begin manuscript orchestration.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={!!showEditModal} onOpenChange={(open) => !open && setShowEditModal(null)}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-10 bg-card border-primary/5 shadow-3xl overflow-hidden glassmorphism">
                    <DialogHeader className="space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-inner">
                            <Save className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-3xl font-black text-foreground tracking-tight uppercase italic">Update Metadata</DialogTitle>
                            <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed tracking-widest uppercase opacity-60">
                                Modify the archival parameters for this publication node.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    {showEditModal && (
                        <form action={handleEdit} className="space-y-6 pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase italic">Volume</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        defaultValue={showEditModal.volumeNumber}
                                        className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-base shadow-inner rounded-2xl px-6"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase italic">Issue</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        defaultValue={showEditModal.issueNumber}
                                        className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-base shadow-inner rounded-2xl px-6"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase italic">Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={showEditModal.year}
                                    className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-base shadow-inner rounded-2xl px-6"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase italic">Month Range</Label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    defaultValue={showEditModal.monthRange}
                                    className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-2 focus-visible:ring-secondary/20 font-black text-base shadow-inner rounded-2xl px-6"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-16 bg-secondary text-white dark:text-black font-black text-xs tracking-[0.2em] shadow-2xl shadow-secondary/20 hover:scale-[1.02] transition-all rounded-2xl cursor-pointer uppercase border-t border-white/20">
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Commit Parameter Updates'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}

PublicationsRegistry.displayName = 'PublicationsRegistry';
