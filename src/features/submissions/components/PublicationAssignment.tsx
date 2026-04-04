'use client'

import { useState } from 'react'
import { Plus, Globe, Loader2, Layers } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    useVolumesIssues,
    useCreateVolumeIssue,
    useAssignPaperToIssue
} from '@/hooks/queries/usePublications'

interface PublicationAssignmentProps {
    submissionId: number;
    currentIssueId?: number | null;
}

export default function PublicationAssignment({ submissionId, currentIssueId }: PublicationAssignmentProps) {
    const { data: volumes = [], isLoading: loading } = useVolumesIssues();
    const createMutation = useCreateVolumeIssue();
    const assignMutation = useAssignPaperToIssue();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState<string>(currentIssueId?.toString() || "");
    const [startPage, setStartPage] = useState<string>("");
    const [endPage, setEndPage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleQuickCreate(formData: FormData) {
        setIsSubmitting(true);
        try {
            toast.promise(
                createMutation.mutateAsync(formData).then((res) => {
                    if (!res.success) throw new Error(res.error || "Failed to initialize cycle");
                    return res;
                }),
                {
                    loading: 'Initializing publication cycle...',
                    success: () => {
                        setShowCreateModal(false);
                        return 'Publication cycle initialized';
                    },
                    error: (err) => err.message
                }
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleAssign() {
        if (!selectedIssueId) {
            toast.error("Please select a target issue node");
            return;
        }

        toast.promise(
            assignMutation.mutateAsync({
                submissionId,
                issueId: parseInt(selectedIssueId),
                startPage: startPage ? parseInt(startPage) : undefined,
                endPage: endPage ? parseInt(endPage) : undefined
            }).then((res) => {
                if (!res.success) throw new Error(res.error || "Failed to assign paper to issue");
                return res;
            }),
            {
                loading: 'Committing manuscript to archive...',
                success: 'Manuscript committed to archive',
                error: (err) => err.message
            }
        );
    }

    if (loading) return (
        <div className="h-11 bg-primary/5 rounded-xl animate-pulse flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary/20 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-4 pt-4 border-t border-emerald-500/10">
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[9px] font-black text-muted-foreground tracking-widest leading-none">Volume and Issue</label>
                        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                            <DialogTrigger asChild>
                                <button className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 tracking-widest flex items-center gap-1 transition-colors cursor-pointer">
                                    <Plus className="w-2.5 h-2.5" /> Add new
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-xl p-8 bg-card border-primary/5 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500/10" />
                                <DialogHeader className="space-y-2">
                                    <DialogTitle className="text-2xl font-black text-foreground tracking-wider">Quick Terminal</DialogTitle>
                                    <DialogDescription className="text-xs font-semibold text-muted-foreground tracking-wider leading-relaxed">
                                        Instantly define a new publication node for immediate manuscript archival.
                                    </DialogDescription>
                                </DialogHeader>
                                <form action={handleQuickCreate} className="space-y-5 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-primary/60 tracking-widest uppercase">Volume</Label>
                                            <Input
                                                name="volume"
                                                type="number"
                                                required
                                                className="h-12 bg-primary/5 border-none font-bold text-sm rounded-xl px-4"
                                                placeholder="e.g. 1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-primary/60 tracking-widest uppercase">Issue</Label>
                                            <Input
                                                name="issue"
                                                type="number"
                                                required
                                                className="h-12 bg-primary/5 border-none font-bold text-sm rounded-xl px-4"
                                                placeholder="e.g. 1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-primary/60 tracking-widest uppercase">Year</Label>
                                        <Input
                                            name="year"
                                            type="number"
                                            required
                                            defaultValue={new Date().getFullYear()}
                                            className="h-12 bg-primary/5 border-none font-black text-sm rounded-xl px-4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-primary/60 tracking-widest uppercase">Month Range</Label>
                                        <Input
                                            name="monthRange"
                                            type="text"
                                            required
                                            placeholder="e.g. Jan - Mar"
                                            className="h-12 bg-primary/5 border-none font-bold text-sm rounded-xl px-4"
                                        />
                                    </div>
                                    <DialogFooter className="pt-2">
                                        <Button disabled={isSubmitting} type="submit" className="w-full h-12 bg-emerald-600 text-white font-black text-[10px] tracking-widest rounded-xl shadow-lg shadow-emerald-600/10 cursor-pointer">
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="relative">
                        <select
                            title="issueId"
                            value={selectedIssueId}
                            onChange={(e) => setSelectedIssueId(e.target.value)}
                            className="w-full h-11 bg-background border border-emerald-500/20 text-[11px] font-black tracking-widest rounded-xl px-4 appearance-none outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-emerald-900 cursor-pointer"
                        >
                            <option value="">Select Target Issue...</option>
                            {volumes.map((vi: any) => (
                                <option key={vi.id} value={vi.id}>
                                    VOL {vi.volume_number} ISSUE {vi.issue_number} ({vi.year})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <Layers className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-muted-foreground tracking-widest leading-none uppercase">Start Page</label>
                        <Input
                            type="number"
                            placeholder="e.g. 4"
                            value={startPage}
                            onChange={(e) => setStartPage(e.target.value)}
                            className="h-10 bg-background border-emerald-500/10 font-bold text-xs rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-muted-foreground tracking-widest leading-none uppercase">End Page</label>
                        <Input
                            type="number"
                            placeholder="e.g. 8"
                            value={endPage}
                            onChange={(e) => setEndPage(e.target.value)}
                            className="h-10 bg-background border-emerald-500/10 font-bold text-xs rounded-lg"
                        />
                    </div>
                </div>
            </div>

            <Button
                onClick={handleAssign}
                disabled={assignMutation.isPending || !selectedIssueId}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] tracking-widest rounded-xl shadow-xl shadow-emerald-600/20 cursor-pointer transition-all active:scale-[0.98]"
            >
                {assignMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                    <Globe className="w-4 h-4 mr-2" />
                )}
                {assignMutation.isPending ? 'INDEXING...' : 'Commit to Archive'}
            </Button>
        </div>
    );
}
