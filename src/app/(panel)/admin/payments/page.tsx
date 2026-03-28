"use client";

import { CreditCard, DollarSign, CheckCircle, Clock, Search, Plus, X, User, ExternalLink, ShieldCheck, Mail, ArrowRight, AlertTriangle, History, Eye, Globe } from 'lucide-react';
import {
    usePayments,
    useUnpaidPapers,
    useInitializePayment,
    useUpdatePaymentStatus
} from '@/hooks/queries/usePayments';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export default function PaymentManagement() {
    const { data: payments = [], isLoading: loading } = usePayments();
    const { data: unpaidPapers = [], isLoading: loadingUnpaid } = useUnpaidPapers();
    const initMutation = useInitializePayment();
    const updateMutation = useUpdatePaymentStatus();

    const [showInitModal, setShowInitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    async function handleInitPayment(formData: FormData) {
        setIsSubmitting(true);
        const submissionId = parseInt(formData.get('submissionId') as string);
        const amount = parseFloat(formData.get('amount') as string);
        const currency = formData.get('currency') as string;

        try {
            const res = await initMutation.mutateAsync({ submissionId, amount, currency });
            if (res.success) {
                setShowInitModal(false);
                toast.success("Transaction initialized");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to initialize transaction");
        }
        setIsSubmitting(false);
    }

    async function handleStatusUpdate(id: number, status: string, transactionId: string) {
        try {
            const res = await updateMutation.mutateAsync({ id, status, transactionId });
            if (res.success) {
                toast.success("Status Synchronized");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    if (loading) return <div className="p-40 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="font-black text-muted-foreground tracking-widest text-xs animate-pulse uppercase">Verifying Financial Records...</p>
    </div>;

    const filteredPayments = payments.filter(p => {
        const matchesSearch =
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.paper_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.transaction_id && p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const revenueStats = {
        gross: payments.filter(p => p.status === 'verified').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
        paid: payments.filter(p => p.status === 'paid' || p.status === 'verified').length,
        projected: payments.filter(p => p.status === 'unpaid').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
        pending: payments.filter(p => p.status === 'unpaid').length
    };

    const stats = [
        { label: 'Gross Revenue (Verified)', value: `₹${revenueStats.gross}`, variant: 'emerald', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Verified Transactions', value: revenueStats.paid, variant: 'blue', icon: <CheckCircle className="w-4 h-4" /> },
        { label: 'Projected Revenue', value: `₹${revenueStats.projected}`, variant: 'orange', icon: <History className="w-4 h-4" /> },
        { label: 'Pending Requests', value: revenueStats.pending, variant: 'rose', icon: <Clock className="w-4 h-4" /> },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-emerald-500/10 text-emerald-600 border-none';
            case 'paid': return 'bg-blue-600/10 text-blue-600 border-none';
            case 'unpaid': return 'bg-orange-500/10 text-orange-600 border-none';
            case 'waived': return 'bg-purple-500/10 text-purple-600 border-none';
            default: return 'bg-muted text-muted-foreground border-none';
        }
    };

    return (
        <section className="space-y-8 pb-12">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-6">
                <div className="space-y-2">
                    <h1 className=" font-black text-foreground tracking-widest uppercase leading-none">Financial Oversight</h1>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground border-l-2 border-primary/10 pl-4">Article Processing Charge (APC) Management and Financial Protocol Enforcement.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={showInitModal} onOpenChange={setShowInitModal}>
                        <DialogTrigger asChild>
                            <Button className="h-12 2xl:h-16 px-6 2xl:px-10 gap-3 bg-primary text-white dark:text-slate-900 font-black text-xs 2xl:text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer">
                                <Plus className="w-6 h-6 2xl:w-8 2xl:h-8" /> Initialize APC Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-xl p-8 bg-card border-primary/5 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary/10" />
                            <DialogHeader className="space-y-2">
                                <DialogTitle className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-black text-foreground tracking-wider uppercase">Manual Request</DialogTitle>
                                <DialogDescription className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
                                    Initialize a payment node for an accepted manuscript without automated triggers.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={handleInitPayment} className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <Label className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-muted-foreground tracking-widest px-1 uppercase">Accepted Paper</Label>
                                    <Select name="submissionId" required>
                                        <SelectTrigger className="h-16 w-full rounded-xl bg-muted border-none px-6 text-sm font-black text-foreground dark:text-primary focus:ring-4 focus:ring-primary/5">
                                            <SelectValue placeholder="Select target paper..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {unpaidPapers.map(paper => (
                                                <SelectItem key={paper.id} value={paper.id.toString()} className="font-bold">
                                                    {paper.paper_id} | {paper.title.slice(0, 50)}...
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-muted-foreground tracking-widest px-1 uppercase">Amount</Label>
                                        <Input name="amount" type="number" step="0.01" required className="h-16 bg-primary/5 border-none focus-visible:ring-4 focus-visible:ring-primary/5 font-black text-sm rounded-xl px-6" placeholder="2500" defaultValue="2500" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-muted-foreground tracking-widest px-1 uppercase">Currency</Label>
                                        <Select name="currency" defaultValue="INR">
                                            <SelectTrigger className="h-16 w-full rounded-xl bg-muted border-none px-6 text-sm font-black text-foreground dark:text-primary focus:ring-4 focus:ring-primary/5">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-primary/5 bg-card">
                                                <SelectItem value="INR" className="font-bold">INR</SelectItem>
                                                <SelectItem value="USD" className="font-bold">USD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" className="w-full h-14 bg-primary text-white dark:text-slate-900 font-bold shadow-vip hover:scale-[1.02] transition-transform rounded-xl cursor-pointer">
                                        CREATE PAYMENT NODE
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 2xl:gap-8 transition-all duration-500">
                {stats.map(stat => (
                    <Card key={stat.label} className="border-primary/5 shadow-vip bg-card group hover:scale-[1.02] transition-all">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' : stat.variant === 'blue' ? 'bg-blue-500/10 text-blue-600' : stat.variant === 'orange' ? 'bg-orange-500/10 text-orange-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                    {stat.icon}
                                </div>
                                <Badge variant="outline" className="h-6 px-2 text-[10px] font-black uppercase tracking-widest opacity-20 group-hover:opacity-100 transition-opacity">Live Metric</Badge>
                            </div>
                            <div className="space-y-1 2xl:space-y-2">
                                <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/40 uppercase tracking-widest leading-none transition-all duration-500">{stat.label}</p>
                                <h3 className=" font-black text-foreground dark:text-white tracking-wider transition-all duration-500">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Registry Search & Filter */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/50 backdrop-blur-sm p-4 2xl:p-6 rounded-xl border border-primary/5 transition-all duration-500">
                <InputGroup className="flex-1 h-16 2xl:h-20 bg-card border-primary/5 rounded-xl shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                    <InputGroupAddon className="pl-6 2xl:pl-8">
                        <Search className="w-5 h-5 2xl:w-7 2xl:h-7 text-primary/20 group-focus-within/input-group:text-primary transition-colors" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search by Title, ID, Author, or Transaction..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-full px-6 2xl:px-10 font-bold text-sm 2xl:text-lg bg-transparent border-0 ring-0 focus-visible:ring-0 transition-all duration-500"
                    />
                </InputGroup>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-16 2xl:h-20 px-8 2xl:px-12 bg-card border border-primary/5 rounded-xl text-xs 2xl:text-sm font-black uppercase tracking-widest shadow-sm focus:ring-4 focus:ring-primary/5 transition-all text-foreground dark:text-primary min-w-[200px] 2xl:min-w-[300px]">
                            <SelectValue placeholder="Global Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                            <SelectItem value="all" className="font-black text-xs uppercase tracking-widest">Global Status</SelectItem>
                            <SelectItem value="unpaid" className="font-black text-xs uppercase tracking-widest">Pending</SelectItem>
                            <SelectItem value="paid" className="font-black text-xs uppercase tracking-widest">Remitted</SelectItem>
                            <SelectItem value="verified" className="font-black text-xs uppercase tracking-widest">Verified</SelectItem>
                            <SelectItem value="waived" className="font-black text-xs uppercase tracking-widest">Waived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Payments List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3 transition-all duration-500">
                        <h2 className=" font-black text-primary tracking-[0.4em] uppercase">Transaction Registry</h2>
                        <span className="text-xs 2xl:text-base font-black text-primary/40 bg-primary/5 px-3 py-1 2xl:px-4 2xl:py-2 rounded-full">{filteredPayments.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredPayments.map((item) => (
                        <Card key={item.id} className="border-primary/5 shadow-vip hover:shadow-2xl hover:scale-[1.005] transition-all group overflow-hidden bg-card relative">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${item.status === 'verified' ? 'bg-emerald-500/20' : item.status === 'paid' ? 'bg-blue-500/20' : item.status === 'waived' ? 'bg-purple-500/20' : 'bg-orange-500/20'}`} />
                            <CardContent className="p-0">
                                <div className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                                    <div className="flex-1 space-y-4 min-w-0">
                                        <div className="flex items-center gap-4">
                                            <Badge className={`h-8 px-3 text-xs font-black uppercase tracking-[0.2em] shadow-sm rounded-lg ${getStatusVariant(item.status)}`}>
                                                {item.status === 'verified' ? 'Authorized' : item.status}
                                            </Badge>
                                            <div className="flex items-center gap-3 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/5 shadow-inner">
                                                <ShieldCheck className="w-4 h-4 text-primary/30" />
                                                <span className="text-[10px] font-black text-primary/60 tracking-widest uppercase">{item.paper_id}</span>
                                            </div>
                                            {item.paid_at && (
                                                <div className="flex items-center gap-2 text-primary/40">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-[10px] font-black tracking-widest uppercase">{new Date(item.paid_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className=" font-black text-foreground dark:text-white leading-wider tracking-wider line-clamp-1 group-hover:text-secondary transition-colors duration-500">
                                            {item.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-12 items-center border-t border-primary/5 pt-6">
                                            <div className="space-y-2">
                                                <p className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/30 uppercase tracking-widest">Primary Investigator</p>
                                                <div className="flex items-center gap-3 text-sm font-black text-primary uppercase">
                                                    <User className="w-4.5 h-4.5 text-primary/40" />
                                                    <span>{item.author_name}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Remittance Value</p>
                                                <div className="flex items-center gap-3 text-lg font-black text-emerald-600">
                                                    <CreditCard className="w-4.5 h-4.5 opacity-40" />
                                                    <span>{item.amount} {item.currency}</span>
                                                </div>
                                            </div>
                                            {item.transaction_id && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Registry Hash</p>
                                                    <div className="flex items-center gap-3 text-xs font-mono font-black text-primary/60 bg-primary/5 px-4 py-1.5 rounded-xl shadow-inner uppercase">
                                                        <span>{item.transaction_id}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex flex-wrap items-center gap-4 border-t xl:border-t-0 pt-6 xl:pt-0 border-primary/5">
                                        <div className="flex items-center gap-3">
                                            <Button asChild variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-primary/5 text-primary/60 dark:text-primary/80 hover:text-primary hover:bg-primary/10 transition-all shadow-sm cursor-pointer">
                                                <a href={`/admin/submissions/${item.submission_id}`} title="View Manuscript Detail">
                                                    <Eye className="w-5 h-5" />
                                                </a>
                                            </Button>
                                            <Button asChild variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-primary/5 text-primary/60 dark:text-primary/80 hover:text-primary hover:bg-primary/10 transition-all shadow-sm cursor-pointer">
                                                <a href={`mailto:${item.author_email}`} title={`Contact ${item.author_name}`}>
                                                    <Mail className="w-5 h-5" />
                                                </a>
                                            </Button>
                                        </div>

                                        <Separator orientation="vertical" className="h-10 mx-2 bg-primary/5 hidden xl:block" />

                                        {item.status === 'unpaid' ? (
                                            <Button
                                                onClick={async () => {
                                                    const txId = prompt("Enter Bank/Gateway Transaction Reference:");
                                                    if (txId) {
                                                        await handleStatusUpdate(item.id, 'paid', txId);
                                                    }
                                                }}
                                                className="h-14 px-8 gap-3 bg-card border-2 border-secondary text-secondary hover:text-white dark:hover:text-slate-900 font-black text-xs tracking-widest rounded-xl hover:bg-secondary transition-all shadow-lg shadow-secondary/5 uppercase"
                                            >
                                                <CheckCircle className="w-5 h-5" /> VERIFY REMITTANCE
                                            </Button>
                                        ) : item.status === 'paid' ? (
                                            <Button
                                                onClick={async () => {
                                                    if (confirm("Finalize archive authorization for this manuscript?")) {
                                                        await handleStatusUpdate(item.id, 'verified', item.transaction_id);
                                                    }
                                                }}
                                                className="h-14 px-10 gap-3 bg-emerald-600 text-white dark:text-slate-900 font-black text-xs tracking-widest rounded-xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] transition-all uppercase"
                                            >
                                                <ShieldCheck className="w-5 h-5" /> AUTHORIZE ARCHIVE
                                            </Button>
                                        ) : item.status === 'verified' ? (
                                            <div className="flex items-center gap-4 bg-emerald-500/10 px-8 py-4 rounded-xl text-emerald-600 border border-emerald-500/10 shadow-inner">
                                                <Globe className="w-5 h-5" />
                                                <span className="font-black text-xs uppercase tracking-widest">Archive Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 bg-purple-500/10 px-8 py-4 rounded-xl text-purple-600 border border-purple-500/10 shadow-inner">
                                                <Badge variant="ghost" className="p-0 hover:bg-transparent"><ArrowRight className="w-5 h-5" /></Badge>
                                                <span className="font-black text-xs uppercase tracking-widest">Fee Waived</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredPayments.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-32 bg-primary/[0.02] border-2 border-dashed border-primary/5 rounded-xl space-y-6">
                            <div className="w-20 h-20 rounded-xl bg-muted shadow-sm flex items-center justify-center text-primary/40">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className=" font-black text-primary/60 dark:text-primary/80 uppercase tracking-[0.3em] ">Record Depth Null</h3>
                                <p className="text-[10px] font-medium text-primary/40 dark:text-primary/60 tracking-widest ">No financial transactions correlate with your active query.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
