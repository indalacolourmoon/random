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
            <div className="p-20 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-primary/40 text-xs">Loading publications...</p>
            </div>
        );
    }

    return (
        <section className="space-y-8 pb-12 max-w-7xl 2xl:max-w-[1900px] mx-auto">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border/50 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/5 shadow-sm">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="font-semibold text-[#000066] text-xl xl:text-2xl">
                            Manage Publications
                        </h1>
                    </div>
                    <p className="text-sm xl:text-base 2xl:text-lg text-muted-foreground border-l-2 border-primary/20 pl-4 py-0.5 max-w-2xl leading-relaxed">
                        {role === 'admin' ? 'Manage the journal publication schedule, volumes, and archival issues.' : 'Review and manage editorial publication cycles.'}
                    </p>
                </div>

                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="h-10 px-6 bg-[#000066] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm hover:bg-[#000088] transition-all">
                            <Plus className="w-4 h-4 mr-2" /> New Issue
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl p-8 bg-card border-border shadow-2xl">
                        <DialogHeader className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/5 flex items-center justify-center text-primary">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">New Publication Issue</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Define a new volume or issue to start collecting papers.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-5 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-primary/70">Volume Number</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        className="h-10 bg-primary/2 border-primary/10 focus-visible:ring-1 text-base rounded-md px-4"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-primary/70">Issue Number</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        className="h-10 bg-primary/2 border-primary/10 focus-visible:ring-1 text-base rounded-md px-4"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-primary/70">Publication Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={new Date().getFullYear()}
                                    className="h-10 bg-primary/2 border-primary/10 focus-visible:ring-1 text-base rounded-md px-4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-primary/70">Month Range</Label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    placeholder="e.g. Jan - Mar"
                                    className="h-10 bg-primary/2 border-primary/10 focus-visible:ring-1 text-base rounded-md px-4"
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-11 bg-primary text-white rounded-lg cursor-pointer">
                                    {isSubmitting ? 'Creating...' : 'Create Issue'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            {/* Publication Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Volumes', value: stats.totalVolumes, icon: Layers, colors: 'text-[#000066] bg-[#000066]/5' },
                    { label: 'Published', value: stats.publishedIssues, icon: CheckCircle2, colors: 'text-[#000066] bg-[#000066]/5' },
                    { label: 'Open', value: stats.openIssues, icon: Clock, colors: 'text-[#000066] bg-[#000066]/5' },
                    { label: 'Indexed', value: stats.totalPapers, icon: FileText, colors: 'text-[#000066] bg-[#000066]/5' },
                ].map((item, idx) => (
                    <div
                        key={item.label}
                        className="p-6 bg-card rounded-xl shadow-sm border border-border/50"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
                            </div>
                            <div className={`w-10 h-10 rounded-lg ${item.colors} flex items-center justify-center border border-border/5`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Grid of Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {volumes.map((v, idx) => (
                    <div key={v.id}>
                        <Card className="border-border/50 shadow-sm transition-all bg-card rounded-xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6 space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Volume {v.volumeNumber}</p>
                                            <h3 className="font-semibold text-gray-900 leading-none text-xl">
                                                Issue {v.issueNumber}
                                            </h3>
                                        </div>
                                        <Badge className={`h-6 px-2 text-[9px] font-bold uppercase rounded-md ${v.status === 'published' ? 'bg-[#000066]/5 text-[#000066] border border-[#000066]/10' : 'bg-orange-500/5 text-orange-600 border border-orange-500/10'}`}>
                                            {v.status === 'published' ? 'Published' : 'Open'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                            <p className="text-[10px] font-semibold text-muted-foreground tracking-wide mb-1">Year</p>
                                            <p className="text-lg font-bold text-foreground">{v.year}</p>
                                        </div>
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                            <p className="text-[10px] font-semibold text-muted-foreground tracking-wide mb-1">Duration</p>
                                            <p className="text-base font-bold text-foreground truncate">{v.monthRange}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {role === 'admin' ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleExpand(v.id)}
                                                className="w-full h-10 gap-2 border-border/50 text-[#000066] font-bold text-[10px] uppercase rounded-lg hover:bg-[#000066]/5"
                                            >
                                                {expandedIssue === v.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                                                {expandedIssue === v.id ? 'Hide' : `View (${v.paperCount || 0})`}
                                            </Button>
                                        ) : (
                                            <div className="w-full h-10 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                                                {v.paperCount || 0} Linked
                                            </div>
                                        )}

                                        <AnimatePresence>
                                            {expandedIssue === v.id && role === 'admin' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-primary/[0.02] rounded-xl border border-primary/10"
                                                >
                                                    <div className="p-4 space-y-3">
                                                        {loadingPapers ? (
                                                            <div className="py-6 text-center">
                                                                <div className="w-6 h-6 border-2 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
                                                            </div>
                                                        ) : issuePapers.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {issuePapers.map((paper) => (
                                                                    <div key={paper.id} className="p-3 bg-card rounded-lg border border-border/50 flex items-center justify-between gap-4 transition-all hover:border-primary/20">
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-semibold text-primary leading-tight line-clamp-1">{paper.title}</p>
                                                                            <p className="text-[10px] text-muted-foreground mt-0.5">ID: {paper.paperId}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Button asChild variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary rounded-md">
                                                                                <a title='View' href={`/admin/submissions/${paper.id}`} target="_blank">
                                                                                    <Eye className="w-4 h-4" />
                                                                                </a>
                                                                            </Button>
                                                                            <Button title='Unlink' onClick={() => handleUnassign(paper.id)} variant="ghost" size="icon" className="w-8 h-8 text-rose-500/60 hover:text-rose-500 rounded-md">
                                                                                <Unlink className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="py-8 text-center text-xs text-muted-foreground font-medium">No papers assigned yet.</div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {v.status === 'open' ? (
                                            <Button
                                                onClick={() => handlePublish(v.id)}
                                                className="w-full h-11 bg-emerald-600 text-white font-bold text-[10px] uppercase rounded-lg shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.98]"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" /> Publish
                                            </Button>
                                        ) : (
                                            <div className="w-full h-11 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 border border-emerald-100">
                                                Published
                                            </div>
                                        )}

                                        <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
                                            <button onClick={() => setShowEditModal(v)} className="text-[10px] font-bold text-[#000066] uppercase hover:underline">Edit</button>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <button onClick={() => handleDelete(v.id)} className="text-[10px] font-bold text-rose-500 uppercase hover:underline">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}

                {volumes.length === 0 && (
                    <div className="col-span-full py-32 bg-primary/[0.02] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground/30 shadow-sm">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-primary/60 text-xl">No Issues Found</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto px-6">There are no publication issues in the registry. Create your first volume and issue to begin.</p>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={!!showEditModal} onOpenChange={(open) => !open && setShowEditModal(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl p-8 bg-card border-border shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/5 flex items-center justify-center text-primary">
                            <Save className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">Update Metadata</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Modify the volume and issue details.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    {showEditModal && (
                        <form action={handleEdit} className="space-y-5 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-primary/70">Volume</Label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        defaultValue={showEditModal.volumeNumber}
                                        className="h-10 bg-primary/2 border-primary/10 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-primary/70">Issue</Label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        defaultValue={showEditModal.issueNumber}
                                        className="h-10 bg-primary/2 border-primary/10 text-base"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-primary/70">Year</Label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={showEditModal.year}
                                    className="h-10 bg-primary/2 border-primary/10 text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-primary/70">Month Range</Label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    defaultValue={showEditModal.monthRange}
                                    className="h-10 bg-primary/2 border-primary/10 text-base"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-11 bg-primary text-white rounded-lg">
                                    {isSubmitting ? 'Updating...' : 'Save Changes'}
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
