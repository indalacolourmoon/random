"use client";

import { CreditCard, DollarSign, CheckCircle, Clock, Search, Plus, User, ShieldCheck, Mail, ArrowRight, AlertTriangle, History, Eye, Globe } from 'lucide-react';
import {
    usePayments,
    useUnpaidPapers,
    useInitializePayment,
    useUpdatePaymentStatus
} from '@/hooks/queries/usePayments';
import Link from 'next/link';
import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
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

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'verified': return 'bg-emerald-500/10 text-emerald-600 border-none';
        case 'paid': return 'bg-blue-600/10 text-blue-600 border-none';
        case 'pending': return 'bg-orange-500/10 text-orange-600 border-none';
        case 'waived': return 'bg-purple-500/10 text-purple-600 border-none';
        default: return 'bg-muted text-muted-foreground border-none';
    }
};

const PaymentItemCard = React.memo(({ item, onUpdateStatus }: { item: any, onUpdateStatus: (id: number, status: any, txId: string) => Promise<void> }) => (
    <Card key={item.id} className="border-primary/5 shadow-vip hover:shadow-2xl hover:scale-[1.005] transition-all group overflow-hidden bg-card relative 2xl:rounded-3xl">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${item.status === 'verified' ? 'bg-emerald-500/20' : item.status === 'paid' ? 'bg-blue-500/20' : item.status === 'waived' ? 'bg-purple-500/20' : 'bg-orange-500/20'}`} />
        <CardContent className="p-0">
            <div className="p-8 2xl:p-14 flex flex-col xl:flex-row xl:items-center justify-between gap-8 2xl:gap-16">
                <div className="flex-1 space-y-4 2xl:space-y-8 min-w-0">
                    <div className="flex items-center gap-4 2xl:gap-8">
                        <Badge className={`h-8 2xl:h-12 px-3 2xl:px-6 shadow-sm rounded-lg ${getStatusVariant(item.status)}`}>
                            {item.status === 'verified' ? 'Authorized' : item.status}
                        </Badge>
                        <div className="flex items-center gap-3 2xl:gap-5 bg-primary/5 px-4 2xl:px-7 py-1.5 2xl:py-3 rounded-full border border-primary/5 shadow-inner">
                            <ShieldCheck className="w-4 h-4 2xl:w-7 2xl:h-7 text-primary/30" />
                            <span className="text-primary/60">{item.paperId}</span>
                        </div>
                    </div>
                    <h3 className="text-foreground dark:text-white line-clamp-1 group-hover:text-secondary transition-colors duration-500">
                        {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-12 2xl:gap-20 items-center border-t border-primary/5 pt-6 2xl:pt-10">
                        <div className="space-y-2 2xl:space-y-3">
                            <p className="opacity-30">Primary Investigator</p>
                            <div className="flex items-center gap-3 2xl:gap-5 text-primary">
                                <User className="w-4.5 h-4.5 2xl:w-6 2xl:h-6 text-primary/40" />
                                <span>{item.authorName}</span>
                            </div>
                        </div>
                        <div className="space-y-2 2xl:space-y-3">
                            <p className="opacity-30">Remittance value</p>
                            <div className="flex items-center gap-3 2xl:gap-5 text-emerald-600">
                                <CreditCard className="w-4.5 h-4.5 opacity-40" />
                                <span>{item.amount} {item.currency}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 flex flex-wrap items-center gap-4 2xl:gap-8 border-t xl:border-t-0 pt-6 xl:pt-0 border-primary/5">
                    <div className="flex items-center gap-3 2xl:gap-5">
                        <Button asChild variant="ghost" size="icon" className="w-12 h-12 2xl:w-20 2xl:h-20 rounded-xl 2xl:rounded-2xl bg-primary/5 text-primary/60 dark:text-primary/80 hover:text-primary hover:bg-primary/20 transition-all shadow-sm cursor-pointer">
                            <Link href={`/admin/submissions/${item.submissionId}`} title="View Manuscript Detail">
                                <Eye className="w-5 h-5 2xl:w-9 2xl:h-9" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="w-12 h-12 2xl:w-20 2xl:h-20 rounded-xl 2xl:rounded-2xl bg-primary/5 text-primary/60 dark:text-primary/80 hover:text-primary hover:bg-primary/20 transition-all shadow-sm cursor-pointer">
                            <a href={`mailto:${item.authorEmail}`} title={`Contact ${item.authorName}`}>
                                <Mail className="w-5 h-5 2xl:w-9 2xl:h-9" />
                            </a>
                        </Button>
                    </div>
                    <Separator orientation="vertical" className="h-10 2xl:h-16 mx-2 2xl:mx-4 bg-primary/5 hidden xl:block" />
                    {item.status === 'pending' ? (
                        <Button
                            onClick={async () => {
                                const txId = prompt("Enter Bank/Gateway Transaction Reference:");
                                if (txId) {
                                    await onUpdateStatus(item.id, 'paid', txId);
                                }
                            }}
                            className="h-14 2xl:h-20 px-8 2xl:px-12 gap-3 2xl:gap-5 bg-card border-2 border-secondary text-secondary hover:text-white dark:hover:text-slate-900 rounded-xl 2xl:rounded-2xl hover:bg-secondary transition-all shadow-lg shadow-secondary/5"
                        >
                            <CheckCircle className="w-5 h-5 2xl:w-9 2xl:h-9" /> VERIFY REMITTANCE
                        </Button>
                    ) : item.status === 'paid' ? (
                        <Button
                            onClick={async () => {
                                if (confirm("Finalize archive authorization for this manuscript?")) {
                                    await onUpdateStatus(item.id, 'verified', item.transactionId || '');
                                }
                            }}
                            className="h-14 2xl:h-20 px-10 2xl:px-14 gap-3 2xl:gap-5 bg-emerald-600 text-white dark:text-slate-900 rounded-xl 2xl:rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] transition-all"
                        >
                            <ShieldCheck className="w-5 h-5 2xl:w-9 2xl:h-9" /> AUTHORIZE ARCHIVE
                        </Button>
                    ) : item.status === 'verified' ? (
                        <div className="flex items-center gap-4 2xl:gap-6 bg-emerald-500/10 px-8 2xl:px-12 py-4 2xl:py-7 rounded-xl 2xl:rounded-2xl text-emerald-600 border border-emerald-500/10 shadow-inner">
                            <Globe className="w-5 h-5 2xl:w-9 2xl:h-9" />
                            <span>Archive Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 2xl:gap-6 bg-purple-500/10 px-8 2xl:px-12 py-4 2xl:py-7 rounded-xl 2xl:rounded-2xl text-purple-600 border border-purple-500/10 shadow-inner">
                            <Badge variant="ghost" className="p-0 hover:bg-transparent"><ArrowRight className="w-5 h-5 2xl:w-9 2xl:h-9" /></Badge>
                            <span>Fee Waived</span>
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
));

PaymentItemCard.displayName = 'PaymentItemCard';

export default function PaymentManagement() {
    const { data: payments = [], isLoading: loading } = usePayments();
    const { data: unpaidPapers = [], isLoading: loadingUnpaid } = useUnpaidPapers();
    const initMutation = useInitializePayment();
    const updateMutation = useUpdatePaymentStatus();

    const [showInitModal, setShowInitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleInitPayment = useCallback(async (formData: FormData) => {
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
    }, [initMutation]);

    const handleStatusUpdate = useCallback(async (id: number, status: 'pending' | 'paid' | 'verified' | 'failed' | 'waived', transactionId: string) => {
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
    }, [updateMutation]);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch =
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.paperId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.transactionId && p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payments, searchQuery, statusFilter]);

    const revenueStats = useMemo(() => {
        return {
            gross: payments.filter(p => p.status === 'verified').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
            paid: payments.filter(p => p.status === 'paid' || p.status === 'verified').length,
            projected: payments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
            pending: payments.filter(p => p.status === 'pending').length
        };
    }, [payments]);

    const stats = useMemo(() => [
        { label: 'Gross revenue (verified)', value: `₹${revenueStats.gross}`, variant: 'emerald', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Verified transactions', value: revenueStats.paid, variant: 'blue', icon: <CheckCircle className="w-4 h-4" /> },
        { label: 'Projected revenue', value: `₹${revenueStats.projected}`, variant: 'orange', icon: <History className="w-4 h-4" /> },
        { label: 'Pending requests', value: revenueStats.pending, variant: 'rose', icon: <Clock className="w-4 h-4" /> },
    ], [revenueStats]);

    if (loading) return <div className="p-40 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground animate-pulse">Verifying Financial Records...</p>
    </div>;

    return (
        <section className="space-y-8 pb-12">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-6 2xl:pb-12">
                <div className="space-y-1 2xl:space-y-2">
                    <h1 className="text-foreground leading-none">Financial oversight</h1>
                    <p className="text-muted-foreground border-l-2 border-primary/10 pl-4 opacity-70">Article processing charge (APC) management and financial protocol enforcement.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={showInitModal} onOpenChange={setShowInitModal}>
                        <DialogTrigger asChild>
                            <Button className="h-10 xl:h-12 2xl:h-14 px-6 gap-3 bg-primary text-white dark:text-slate-900 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer">
                                <Plus className="w-5 h-5 2xl:w-6 2xl:h-6" /> Initialize APC request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-xl p-8 bg-card border-primary/5 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary/10" />
                            <DialogHeader className="space-y-2">
                                <DialogTitle className="text-foreground">Manual Request</DialogTitle>
                                <DialogDescription className="text-muted-foreground leading-relaxed opacity-60">
                                    Initialize a payment node for an accepted manuscript without automated triggers.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={handleInitPayment} className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <Label className="text-muted-foreground px-1">Accepted Paper</Label>
                                    <Select name="submissionId" required>
                                        <SelectTrigger className="h-16 w-full rounded-xl bg-muted border-none px-6 text-foreground dark:text-primary focus:ring-4 focus:ring-primary/5">
                                            <SelectValue placeholder="Select target paper..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {unpaidPapers.map(paper => (
                                                <SelectItem key={paper.id} value={paper.id.toString()}>
                                                    {paper.paperId} | {paper.title.slice(0, 50)}...
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground px-1">Amount</Label>
                                        <Input name="amount" type="number" step="0.01" required className="h-16 bg-primary/5 border-none focus-visible:ring-4 focus-visible:ring-primary/5 rounded-xl px-6" placeholder="2500" defaultValue="2500" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground px-1">Currency</Label>
                                        <Select name="currency" defaultValue="INR">
                                            <SelectTrigger className="h-16 w-full rounded-xl bg-muted border-none px-6 text-foreground dark:text-primary focus:ring-4 focus:ring-primary/5">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-primary/5 bg-card">
                                                <SelectItem value="INR">INR</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-white dark:text-slate-900 shadow-vip hover:scale-[1.02] transition-transform rounded-xl cursor-pointer">
                                        {isSubmitting ? "CREATING NODE..." : "CREATE PAYMENT NODE"}
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
                    <Card key={stat.label} className="border-primary/5 shadow-vip bg-card group hover:scale-[1.02] transition-all 2xl:rounded-3xl">
                        <CardContent className="p-8 2xl:p-14">
                            <div className="flex items-center justify-between mb-6 2xl:mb-12">
                                <div className={`w-12 h-12 2xl:w-20 2xl:h-20 rounded-xl 2xl:rounded-2xl flex items-center justify-center ${stat.variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' : stat.variant === 'blue' ? 'bg-blue-500/10 text-blue-600' : stat.variant === 'orange' ? 'bg-orange-500/10 text-orange-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                    <div className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:2xl:w-10 [&>svg]:2xl:h-10">
                                        {stat.icon}
                                    </div>
                                </div>
                                <Badge variant="outline" className="h-6 2xl:h-9 px-2 2xl:px-4 opacity-20 group-hover:opacity-100 transition-opacity">Live Metric</Badge>
                            </div>
                            <div className="space-y-1 2xl:space-y-2">
                                <p className="opacity-40 leading-none transition-all duration-500">{stat.label}</p>
                                <h3 className="text-foreground dark:text-white transition-all duration-500">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Registry Search & Filter */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/50 backdrop-blur-sm p-4 2xl:p-10 rounded-xl border border-primary/5 transition-all duration-500">
                <InputGroup className="flex-1 h-16 2xl:h-24 bg-card border-primary/5 rounded-xl shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                    <InputGroupAddon className="pl-6 2xl:pl-10">
                        <Search className="w-5 h-5 2xl:w-8 2xl:h-8 text-primary/20 group-focus-within/input-group:text-primary transition-colors" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search by Title, ID, Author, or Transaction..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-full px-6 2xl:px-12 bg-transparent border-0 ring-0 focus-visible:ring-0 transition-all duration-500"
                    />
                </InputGroup>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-16 2xl:h-24 px-8 2xl:px-12 bg-card border border-primary/5 rounded-xl shadow-sm focus:ring-4 focus:ring-primary/5 transition-all text-foreground dark:text-primary min-w-[200px] 2xl:min-w-[350px]">
                            <SelectValue placeholder="Global Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                            <SelectItem value="all">Global Status</SelectItem>
                            <SelectItem value="unpaid">Pending</SelectItem>
                            <SelectItem value="paid">Remitted</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="waived">Waived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Payments List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3 transition-all duration-500">
                        <h2 className="text-primary">Transaction registry</h2>
                        <span className="opacity-40 bg-primary/5 px-3 py-1 rounded-full">{filteredPayments.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 2xl:gap-8">
                    {filteredPayments.map((item) => (
                        <PaymentItemCard key={item.id} item={item} onUpdateStatus={handleStatusUpdate} />
                    ))}

                    {filteredPayments.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-32 bg-primary/2 border-2 border-dashed border-primary/5 rounded-xl space-y-6">
                            <div className="w-20 h-20 rounded-xl bg-muted shadow-sm flex items-center justify-center text-primary/40">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                             <div className="text-center space-y-2">
                                <h3 className="text-primary/60 dark:text-primary/80">Record Depth Null</h3>
                                <p className="opacity-40 dark:text-primary/60">No financial transactions correlate with your active query.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
