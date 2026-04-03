'use client'

import { Plus, BookOpen, Clock, CheckCircle2, AlertCircle, Trash2, Globe, Calendar, Layers, CheckCircle, AlertTriangle } from 'lucide-react';
import { useVolumesIssues, useCreateVolumeIssue, usePublishIssue } from '@/hooks/queries/usePublications';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    const publishMutation = usePublishIssue();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleCreate(formData: FormData) {
        setIsSubmitting(true);
        try {
            const res = await createMutation.mutateAsync(formData);
            if (res.success) {
                setShowCreateModal(false);
                toast.success("Cycle initialized");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to initialize cycle");
        }
        setIsSubmitting(false);
    }

    async function handlePublish(id: number) {
        if (!confirm('Are you sure you want to PUBLISH this issue? This will also update the status of all assigned papers.')) return;
        try {
            const res = await publishMutation.mutateAsync(id);
            if (res.success) {
                toast.success("Issue published");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to publish issue");
        }
    }

    if (loading) return <div className="p-24 text-center font-semibold text-primary/30 uppercase tracking-[0.3em] text-sm animate-pulse flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        Accessing Publication Archives...
    </div>;

    return (
        <section className="space-y-6 pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                <div className="space-y-2">
                    <h1 className="font-serif text-2xl xl:text-3xl 2xl:text-4xl font-semibold text-foreground tracking-tight capitalize leading-none">Volumes & issues</h1>
                    <p className="text-xs xl:text-sm font-semibold text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2 capitalize tracking-wide transition-all duration-500">Manage journal publication schedule and editorial cycles.</p>
                </div>

                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="h-10 px-6 gap-3 bg-primary text-white dark:text-slate-900 font-semibold text-[10px] xl:text-xs 2xl:text-sm tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer capitalize">
                            <Plus className="w-5 h-5" /> New publication cycle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl rounded-xl p-12 border-none shadow-vip bg-card">
                        <DialogHeader className="space-y-3">
                            <DialogTitle className="text-xl xl:text-2xl font-semibold text-foreground dark:text-primary tracking-tight capitalize">New publication hub</DialogTitle>
                            <DialogDescription className="text-[10px] xl:text-xs font-semibold text-primary/40 capitalize tracking-widest">
                                Initialize a new volume or issue for manuscript aggregation.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-6 pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-primary/60 tracking-[0.2em] px-1 uppercase">Volume</label>
                                    <Input
                                        name="volume"
                                        type="number"
                                        required
                                        className="h-14 bg-muted border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-semibold text-sm px-5 shadow-inner rounded-xl text-foreground dark:text-primary"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-primary/60 tracking-[0.2em] px-1 uppercase">Issue</label>
                                    <Input
                                        name="issue"
                                        type="number"
                                        required
                                        className="h-14 bg-muted border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-semibold text-sm px-5 shadow-inner rounded-xl text-foreground dark:text-primary"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-primary/60 tracking-[0.2em] px-1 uppercase">Year</label>
                                <Input
                                    name="year"
                                    type="number"
                                    required
                                    defaultValue={new Date().getFullYear()}
                                    className="h-14 bg-primary/5 border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-semibold text-sm px-5 shadow-inner rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-primary/60 tracking-[0.2em] px-1 uppercase">Month Cycle</label>
                                <Input
                                    name="monthRange"
                                    type="text"
                                    required
                                    placeholder="e.g. Jan - Mar"
                                    className="h-14 bg-primary/5 border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-semibold text-sm px-5 shadow-inner rounded-xl"
                                />
                            </div>

                            <DialogFooter className="pt-6">
                                <Button disabled={isSubmitting} type="submit" className="w-full h-14 font-semibold text-sm tracking-widest shadow-lg shadow-primary/20 bg-primary text-white dark:text-slate-900 hover:scale-[1.02] transition-all capitalize rounded-xl cursor-pointer">
                                    {isSubmitting ? 'Initializing cycle...' : 'Create publication hub'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            {/* Grid of Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {volumes.map((v) => (
                    <Card key={v.id} className="border-primary/5 shadow-vip bg-card hover:border-primary/20 transition-all group overflow-hidden rounded-xl">
                        <CardContent className="p-0">
                            <div className="p-10 space-y-8">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-primary/40 capitalize tracking-widest">Archive volume {v.volume_number}</p>
                                        <h3 className="font-serif text-lg xl:text-xl font-semibold text-foreground dark:text-primary tracking-tight leading-none group-hover:text-emerald-600 transition-colors capitalize">Issue {v.issue_number}</h3>
                                    </div>
                                    <Badge className={`h-6 px-3 text-[10px] font-semibold capitalize tracking-widest rounded-lg shadow-sm border-none ${v.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                        {v.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-card p-6 rounded-xl border border-primary/5 shadow-inner">
                                        <Calendar className="w-6 h-6 text-primary/30 mb-3" />
                                        <p className="text-[10px] font-semibold text-primary/40 uppercase tracking-widest mb-1">Year</p>
                                        <p className="text-xl font-semibold text-primary">{v.year}</p>
                                    </div>
                                    <div className="bg-card p-6 rounded-xl border border-primary/5 shadow-inner">
                                        <Layers className="w-6 h-6 text-primary/30 mb-3" />
                                        <p className="text-[10px] font-semibold text-primary/40 uppercase tracking-widest mb-1">Cycle</p>
                                        <p className="text-xl font-semibold text-primary truncate">{v.month_range}</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {v.status === 'open' ? (
                                        <Button
                                            onClick={() => handlePublish(v.id)}
                                            className="w-full h-14 gap-3 font-semibold text-xs uppercase tracking-widest bg-primary text-white dark:text-slate-900 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all rounded-xl"
                                        >
                                            <Globe className="w-6 h-6" /> Publish to Archive
                                        </Button>
                                    ) : (
                                        <div className="w-full h-14 bg-emerald-500/10 text-emerald-600 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-emerald-500/20 shadow-sm">
                                            <CheckCircle className="w-6 h-6" /> Static in Archives
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {volumes.length === 0 && (
                    <div className="col-span-full py-32 bg-primary/5 border border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center mb-8 shadow-inner">
                            <BookOpen className="w-12 h-12 text-primary/40" />
                        </div>
                        <h3 className=" font-semibold text-primary/60 tracking-wider mb-2">Archive Unavailable</h3>
                        <p className="text-xs font-semibold text-primary/30 uppercase tracking-[0.2em]">Initialize your first journal volume to begin the legacy</p>
                    </div>
                )}
            </div>
        </section>
    );
}
