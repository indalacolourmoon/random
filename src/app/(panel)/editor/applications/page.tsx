"use client";

export const dynamic = "force-dynamic";
import { useApplications, useApproveApplication, useRejectApplication } from '@/hooks/queries/useApplications';
import { useState, Suspense } from 'react';
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
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function ManageApplicationsContent() {
    const { data: applications = [], isLoading: loading } = useApplications();
    const approveMutation = useApproveApplication();
    const rejectMutation = useRejectApplication();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'reviewer' | 'editor'>('all');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState<{ id: number; text: string } | null>(null);

    const handleApprove = async (id: number) => {
        if (!confirm('Are you sure you want to APPROVE this application?\nThis will automatically create a user account and send an invitation.')) return;

        setProcessingId(id);
        try {
            const result = await approveMutation.mutateAsync(id);
            if (result.success) {
                toast.success('Application approved successfully!');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to approve application');
        }
        setProcessingId(null);
    };

    const handleReject = async (id: number) => {
        if (!rejectionReason || rejectionReason.id !== id) {
            setRejectionReason({ id, text: "" });
            return;
        }

        const reason = rejectionReason.text;
        const finalReason = reason.trim();
        if (finalReason.length < 20) {
            toast.error("Reason Required", {
                 description: "Please provide a rejection reason (min 20 characters)."
            });
            return;
        }

        setProcessingId(id);
        try {
            const result = await rejectMutation.mutateAsync({ id, reason: finalReason });
            if (result.success) {
                toast.success('Application rejected successfully!');
                setRejectionReason(null);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to reject application');
        }
        setProcessingId(null);
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || app.application_type === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <section className="space-y-6 pb-20">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                <div className="space-y-2">
                    <h1 className=" font-black text-foreground tracking-widest uppercase leading-none">Board Proposals</h1>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground border-l-2 border-primary/10 pl-4">Vetting pipeline for editorial staff and technical reviewer candidates.</p>
                </div>
                <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border/50 shrink-0 h-12">
                    <Button
                        variant={filterRole === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterRole('all')}
                        className={`h-full px-6 text-xs font-black tracking-widest transition-all rounded-lg ${filterRole === 'all' ? 'bg-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Display All
                    </Button>
                    <Button
                        variant={filterRole === 'reviewer' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterRole('reviewer')}
                        className={`h-full px-6 text-xs font-black tracking-widest transition-all rounded-lg ${filterRole === 'reviewer' ? 'bg-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Reviewers
                    </Button>
                    <Button
                        variant={filterRole === 'editor' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterRole('editor')}
                        className={`h-full px-6 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest transition-all rounded-lg ${filterRole === 'editor' ? 'bg-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Editors
                    </Button>
                </div>
            </header>

            {/* Filter Bar */}
            <Card className="border-border/50 shadow-sm overflow-hidden bg-muted/10 rounded-xl">
                <CardContent className="p-5 flex flex-col md:flex-row gap-5 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="text"
                            placeholder="Query Candidate Database..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-background border-none h-12 pl-12 text-sm font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
                        />
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-background rounded-xl border border-border/50 shrink-0 h-12">
                        <Clock className="w-4.5 h-4.5 text-primary" />
                        <span className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-muted-foreground tracking-widest uppercase">{filteredApps.length} Pending Records</span>
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-6 text-muted-foreground">
                        <div className="w-10 h-10 border-[3px] border-primary/10 border-t-primary rounded-full animate-spin" />
                        <p className="font-black text-xs tracking-[0.2em] animate-pulse">Accessing Secure Records...</p>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-muted/20 border border-dashed border-border/50 rounded-xl">
                        <Filter className="w-12 h-12 text-muted-foreground/20 mb-6" />
                        <p className="text-xs font-black text-muted-foreground tracking-[0.2em] uppercase">No join requests detected </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredApps.map((app) => (
                            <motion.div
                                key={app.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="border-border/50 shadow-sm overflow-hidden hover:border-primary/20 transition-all group">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="p-5 flex-1 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                                            <div className="w-24 h-24 rounded-xl bg-muted border border-border/50 flex-shrink-0 overflow-hidden group-hover:shadow-xl transition-all shadow-inner relative">
                                                {app.photo_url ? (
                                                    <img src={app.photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-10 h-10 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3 flex-1 text-center sm:text-left min-w-0">
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                                    <h3 className=" font-black text-foreground tracking-wider truncate">{app.full_name}</h3>
                                                    <Badge className={`h-6 px-2.5 text-[10px] font-black tracking-widest uppercase border-none ${app.application_type === 'editor'
                                                        ? 'bg-purple-500/10 text-purple-600'
                                                        : 'bg-emerald-500/10 text-emerald-600'
                                                        }`}>
                                                        {app.application_type}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2.5 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary/60" /> {app.email}</p>
                                                    <p className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary/60" /> {app.institute}</p>
                                                    <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary/60" /> {app.designation}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                                                    <Button asChild variant="secondary" size="sm" className="h-10 px-5 gap-2.5 text-xs font-black tracking-widest rounded-xl hover:bg-muted border border-border/20 cursor-pointer">
                                                        <a href={app.cv_url} target="_blank" className="flex items-center gap-2.5 cursor-pointer">
                                                            <FileText className="w-4.5 h-4.5" /> View Academic Profile
                                                        </a>
                                                    </Button>
                                                    <p className="text-[11px] font-black text-muted-foreground opacity-50 tracking-widest uppercase">
                                                        Authenticated: {new Date(app.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-muted/10 md:w-72 p-6 border-t md:border-t-0 md:border-l border-border/50 flex flex-col justify-center gap-3">
                                             {rejectionReason?.id === app.id && rejectionReason && (
                                                 <div className="space-y-3 mb-3 animate-in fade-in slide-in-from-top-1">
                                                     <textarea
                                                         className="w-full h-24 p-3 text-[10px] bg-background border border-border/50 rounded-xl focus:ring-1 focus:ring-red-500/20 outline-none resize-none font-medium text-foreground placeholder:text-muted-foreground/50"
                                                         placeholder="Reason for rejection (min 20 characters)..."
                                                         value={rejectionReason.text}
                                                         onChange={(e) => setRejectionReason({ id: app.id, text: e.target.value })}
                                                     />
                                                     <Button
                                                         variant="ghost"
                                                         size="sm"
                                                         onClick={() => setRejectionReason(null)}
                                                         className="h-8 w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                                                     >
                                                         Cancel
                                                     </Button>
                                                 </div>
                                             )}
                                             
                                             <Button
                                                 disabled={processingId !== null}
                                                 onClick={() => handleReject(app.id)}
                                                 variant={rejectionReason?.id === app.id ? "destructive" : "outline"}
                                                 className={`w-full h-12 gap-2.5 font-black tracking-widest transition-all rounded-xl cursor-pointer ${rejectionReason?.id === app.id 
                                                     ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20' 
                                                     : 'border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white'
                                                 } ${rejectionReason?.id === app.id ? 'text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs' : 'text-xs'}`}
                                             >
                                                 {processingId === app.id ? (
                                                     <span className="animate-pulse">Declining...</span>
                                                 ) : (
                                                     <>
                                                         {rejectionReason?.id === app.id ? 'Confirm Rejection' : 'Reject Request'}
                                                         <X className="w-4.5 h-4.5" />
                                                     </>
                                                 )}
                                             </Button>

                                             {!rejectionReason && (
                                                 <Button
                                                     disabled={processingId !== null}
                                                     onClick={() => handleApprove(app.id)}
                                                     className="w-full h-12 gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs tracking-widest border-none shadow-lg shadow-emerald-600/20 transition-all rounded-xl cursor-pointer"
                                                 >
                                                     {processingId === app.id ? (
                                                         <span className="animate-pulse">Authorizing...</span>
                                                     ) : (
                                                         <>
                                                             Approve Proposal
                                                             <CheckCircle className="w-4.5 h-4.5" />
                                                         </>
                                                     )}
                                                 </Button>
                                             )}
                                         </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </section>
    );
}

export default function ManageApplicationsPage() {
    return (
        <Suspense fallback={<div className="p-20 flex flex-col items-center justify-center gap-4 text-muted-foreground"><div className="w-8 h-8 border-2 border-primary/10 border-t-primary rounded-full animate-spin" /><p className="font-black text-[10px] tracking-[0.2em] animate-pulse">Initializing Interface...</p></div>}>
            <ManageApplicationsContent />
        </Suspense>
    );
}
