"use client";

import { Plus, BookOpen, Clock, CheckCircle2, AlertCircle, Trash2, Globe, Calendar, Layers, CheckCircle, AlertTriangle, Save, History, ChevronDown as ChevronDownIcon, ChevronUp, FileText, Link, Eye, Unlink } from 'lucide-react';

import {
    useVolumesIssues,
    usePapersByIssue,
    useCreateVolumeIssue,
    useUpdateVolumeIssue,
    useDeleteVolumeIssue,
    usePublishIssue,
    useUnassignPaper
} from '@/hooks/queries/usePublications';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function PublicationsPage() {
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


    if (loading) {
        return (
            <div className="p-32 text-center space-y-6">
                <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-black text-primary/40 tracking-[0.4em] text-xs animate-pulse">Syncing Publication Registry...</p>
            </div>
        );
    }

    return (
        <section className="space-y-8 pb-24">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8 2xl:pb-16">
                <div className="space-y-2 2xl:space-y-4">
                    <h1 className="font-black text-primary tracking-widest uppercase leading-none 2xl:text-3xl">Volumes & Issues</h1>
                    <p className="text-xs sm:text-sm 2xl:text-xl font-medium text-primary/40 border-l-2 border-primary/10 pl-4">Journal publication schedule & editorial cycle management protocols.</p>
                </div>

                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="h-16 2xl:h-20 px-10 2xl:px-14 gap-3 bg-primary text-white dark:text-slate-900 font-black text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-lg tracking-[0.3em] rounded-xl 2xl:rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                            <Plus className="w-6 h-6 2xl:w-8 2xl:h-8" />create new
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-xl p-8 bg-card border-primary/5 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary/10" />
                        <DialogHeader className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner mb-0">
                                <Plus className="w-6 h-6" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl 2xl:text-3xl font-black text-foreground dark:text-primary tracking-wider uppercase">New Publication Hub</DialogTitle>
                            <DialogDescription className="text-[11px] 2xl:text-sm font-semibold text-muted-foreground leading-relaxed tracking-wider uppercase opacity-60">
                                Define a new volume or issue for manuscript aggregation.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Volume</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        className="h-12 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-sm shadow-inner rounded-xl px-4"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Issue</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        className="h-12 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-sm shadow-inner rounded-xl px-4"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={new Date().getFullYear()}
                                    className="h-12 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-black text-sm shadow-inner rounded-xl px-4"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Cycle Duration</Label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    placeholder="e.g. Jan - Mar"
                                    className="h-12 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-sm shadow-inner rounded-xl px-4"
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-12 bg-primary text-white dark:text-slate-900 font-black text-[10px] xl:text-[11px] 2xl:text-base tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all rounded-xl cursor-pointer uppercase">
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Deploy Publication Cycle'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>


            {/* Grid of Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {volumes.map((v) => (
                    <Card key={v.id} className="border-primary/5 shadow-vip hover:scale-[1.01] transition-all group overflow-hidden bg-card relative 2xl:rounded-[2rem]">
                        <div className={`absolute top-0 left-0 w-1 h-full ${v.status === 'published' ? 'bg-emerald-500/40' : 'bg-orange-500/40'}`} />
                        <CardContent className="p-0">
                            <div className="p-8 2xl:p-14 space-y-6 2xl:space-y-10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1 2xl:space-y-3">
                                        <div className="flex items-center gap-3">
                                            <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-base font-black text-primary/40 tracking-[0.3em] uppercase">Global Volume {v.volume_number}</p>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button title='save changes' onClick={() => setShowEditModal(v)} className="p-1.5 2xl:p-3 hover:text-primary transition-colors hover:bg-primary/15 rounded-md 2xl:rounded-xl">
                                                    <Save className="w-4 h-4 2xl:w-7 2xl:h-7" />
                                                </button>
                                                <button title='delete' onClick={() => handleDelete(v.id)} className="p-1.5 2xl:p-3 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-md 2xl:rounded-xl">
                                                    <Trash2 className="w-4 h-4 2xl:w-7 2xl:h-7" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className=" font-black text-primary tracking-wider leading-none group-hover:text-secondary transition-colors 2xl:text-2xl">Issue {v.issue_number}</h3>
                                    </div>
                                    <Badge className={`h-8 2xl:h-12 px-3 2xl:px-6 text-xs 2xl:text-lg font-black tracking-widest border-none rounded-lg 2xl:rounded-xl ${v.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                        {v.status === 'published' ? (
                                            <span className="flex items-center gap-2"><Globe className="w-4 h-4 2xl:w-7 2xl:h-7" /> Published</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><Clock className="w-4 h-4 2xl:w-7 2xl:h-7" /> Open Cycle</span>
                                        )}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-5 2xl:gap-8">
                                    <div className="bg-primary/5 p-5 2xl:p-8 rounded-xl 2xl:rounded-2xl border border-primary/5 shadow-inner">
                                        <Calendar className="w-5 h-5 2xl:w-7 2xl:h-7 text-primary/20 mb-2.5 2xl:mb-4" />
                                        <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/40 tracking-widest mb-1 2xl:mb-2 uppercase">Year</p>
                                        <p className="text-base 2xl:text-2xl font-black text-primary ">{v.year}</p>
                                    </div>
                                    <div className="bg-primary/5 p-5 2xl:p-8 rounded-xl 2xl:rounded-2xl border border-primary/5 shadow-inner">
                                        <Layers className="w-5 h-5 2xl:w-7 2xl:h-7 text-primary/20 mb-2.5 2xl:mb-4" />
                                        <p className="text-[10px] 2xl:text-xs font-black text-primary/40 tracking-widest mb-1 2xl:mb-2 uppercase">Cycle</p>
                                        <p className="text-base 2xl:text-xl font-black text-primary truncate ">{v.month_range}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 2xl:space-y-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => toggleExpand(v.id)}
                                        className="w-full h-12 2xl:h-16 gap-3 2xl:gap-4 border-primary/20 text-primary/80 font-black text-xs 2xl:text-lg tracking-widest rounded-xl 2xl:rounded-2xl hover:bg-primary/20 hover:text-primary shadow-sm uppercase transition-all"
                                    >
                                        {expandedIssue === v.id ? <ChevronUp className="w-5 h-5 2xl:w-7 2xl:h-7 transition-transform" /> : <ChevronDownIcon className="w-5 h-5 2xl:w-7 2xl:h-7 transition-transform" />}
                                        {expandedIssue === v.id ? 'Hide Manuscripts' : `View Manuscripts (${v.paper_count || 0})`}
                                    </Button>

                                    <AnimatePresence>
                                        {expandedIssue === v.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-primary/[0.02] rounded-xl border border-primary/5"
                                            >
                                                <div className="p-4 space-y-4">
                                                    {loadingPapers ? (
                                                        <div className="py-8 text-center">
                                                            <div className="w-6 h-6 border-2 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
                                                        </div>
                                                    ) : issuePapers.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {issuePapers.map((paper) => (
                                                                <div key={paper.id} className="p-3 bg-card rounded-xl border border-primary/5 shadow-sm space-y-2">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0">
                                                                            <p className="text-[10px] font-black text-primary tracking-widest leading-normal line-clamp-2 uppercase">{paper.title}</p>
                                                                            <p className="text-[10px] font-semibold text-primary/40 mt-1 uppercase tracking-widest">Node ID: {paper.paper_id}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                            <Button asChild variant="ghost" size="icon" className="w-8 h-8 text-primary/40 hover:text-primary hover:bg-primary/15 rounded-lg cursor-pointer">
                                                                                <a title='view paper' href={`/admin/submissions/${paper.id}`} target="_blank">
                                                                                    <Eye className="w-4 h-4" />
                                                                                </a>
                                                                            </Button>
                                                                            <Button title='unassign' onClick={() => handleUnassign(paper.id)} variant="ghost" size="icon" className="w-8 h-8 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                                                                                <Unlink className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[9px] font-black text-primary/20 text-center py-4 tracking-widest">No manuscripts assigned</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {v.status === 'open' ? (
                                        <Button
                                            onClick={() => handlePublish(v.id)}
                                            className="w-full h-14 2xl:h-16 gap-3 2xl:gap-4 bg-primary text-white dark:text-slate-900 font-black text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-lg tracking-widest shadow-xl shadow-primary/20 rounded-xl 2xl:rounded-2xl hover:bg-emerald-600 transition-all uppercase"
                                        >
                                            <CheckCircle className="w-5 h-5 2xl:w-8 2xl:h-8" /> Finalize & Publish Issue
                                        </Button>
                                    ) : (
                                        <div className="w-full h-14 2xl:h-20 bg-emerald-500/5 text-emerald-600 rounded-xl 2xl:rounded-2xl font-black text-xs 2xl:text-xl tracking-widest flex items-center justify-center gap-3 2xl:gap-5 border border-emerald-500/10 shadow-inner uppercase">
                                            <Globe className="w-5 h-5 2xl:w-10 2xl:h-10" /> Immutable Archive Locked
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {volumes.length === 0 && (
                    <div className="col-span-full py-40 bg-primary/5 border-2 border-dashed border-primary/10 rounded-xl flex flex-col items-center justify-center text-center shadow-inner space-y-8">
                        <div className="w-24 h-24 rounded-xl bg-card border border-primary/10 flex items-center justify-center text-primary/10 shadow-sm">
                            <BookOpen className="w-12 h-12" />
                        </div>
                        <div className="space-y-3">
                            <h3 className=" font-black text-primary/40 tracking-[0.4em] uppercase">Global Vault Offline</h3>
                            <p className="text-xs font-semibold text-primary/30 tracking-widest max-w-sm leading-relaxed uppercase">No publication cycles detected. Initialize first volume to begin manuscript tracking.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={!!showEditModal} onOpenChange={(open) => !open && setShowEditModal(null)}>
                <DialogContent className="sm:max-w-md rounded-xl p-8 bg-card border-primary/5 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-secondary/10" />
                    <DialogHeader className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary shadow-inner mb-0">
                            <Save className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl 2xl:text-3xl font-black text-foreground dark:text-primary tracking-wider uppercase">Update Metadata</DialogTitle>
                        <DialogDescription className="text-[11px] 2xl:text-sm font-semibold text-muted-foreground leading-relaxed tracking-wider uppercase opacity-60">
                            Modify the archival parameters for this publication node.
                        </DialogDescription>
                    </DialogHeader>
                    {showEditModal && (
                        <form action={handleEdit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Volume</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        defaultValue={showEditModal.volume_number}
                                        className="h-12 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-sm shadow-inner rounded-xl px-4"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Issue</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        defaultValue={showEditModal.issue_number}
                                        className="h-12 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-sm shadow-inner rounded-xl px-4"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={showEditModal.year}
                                    className="h-12 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-black text-sm shadow-inner rounded-xl px-4"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] 2xl:text-xs font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Month Range</Label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    defaultValue={showEditModal.month_range}
                                    className="h-12 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-sm shadow-inner rounded-xl px-4"
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-12 font-black text-[10px] 2xl:text-base tracking-[0.2em] bg-secondary text-white shadow-xl shadow-secondary/20 hover:scale-[1.02] transition-all rounded-xl cursor-pointer uppercase">
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
