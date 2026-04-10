'use client'

import { CreditCard, Loader2, CheckCircle2, AlertCircle, TrendingUp, Handshake, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/layout/PageHeader";
import { useTrackManuscript } from '@/hooks/queries/usePublic';
import Script from 'next/script';
import RazorpayPayment from '@/features/submissions/components/RazorpayPayment';

interface PaymentClientProps {
    id: string;
    settings: Record<string, string>;
}

export default function PaymentClient({ id, settings }: PaymentClientProps) {
    const apcTotal = parseFloat(settings?.apc_inr || '2500');
    const apcFee = Math.floor(apcTotal * 0.85);
    const apcIndexing = apcTotal - apcFee;
    const journalShortName = settings.journal_short_name || "IJITEST";

    const { data: queryData, isLoading: loading, error: queryError } = useTrackManuscript(id, "", true);
    const manuscript = queryData?.success && queryData.data?.manuscript ? queryData.data.manuscript : null;
    const [processing, setProcessing] = useState(false);
    const [paid, setPaid] = useState(false);

    const error = queryError ? "Failed to fetch manuscript details." : (queryData && !queryData.success ? queryData.error : (!manuscript && !loading ? "Manuscript not found or invalid link." : ""));

    // Real payment is handled by the RazorpayPayment component
    // handlePayment removed as it was a mock

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-50">Secure Session Initializing</p>
            </div>
        </div>
    );

    if (error || (manuscript && manuscript.status !== 'accepted' && manuscript.status !== 'published')) return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-md w-full bg-card border border-border/50 rounded-xl text-center p-8 sm:p-12 shadow-sm border-l-4 border-l-destructive/50">
                <div className="w-16 h-16 bg-destructive/5 rounded-xl flex items-center justify-center mx-auto mb-8 text-destructive">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold m-0">Access Denied</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed m-0">
                        Credentials could not be verified for active payment processing.
                    </p>
                </div>
                <Button asChild className="h-10 mt-8 px-8 bg-[#000066] hover:bg-[#000088] text-white font-bold text-[10px] tracking-wider rounded-lg shadow-sm transition-all uppercase">
                    <Link href="/track">Return home</Link>
                </Button>
            </div>
        </div>
    );

    if (paid || (manuscript && manuscript.status === 'published')) return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-md w-full bg-card border border-border/50 rounded-xl text-center p-8 sm:p-12 shadow-sm border-l-4 border-l-secondary">
                <div className="w-16 h-16 bg-secondary/5 rounded-xl flex items-center justify-center mx-auto mb-8 text-secondary">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold m-0">Grant Secured</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed m-0">
                        Payment processed successfully. Your research is now queued for global indexing.
                    </p>
                </div>
                <div className="pt-8 space-y-4">
                    <Button asChild className="h-10 w-full bg-[#000066] hover:bg-[#000088] text-white font-bold text-[10px] tracking-wider rounded-lg shadow-sm transition-all uppercase">
                        <Link href="/">Return home</Link>
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <PageHeader
                title="Manuscript Grant"
                description="Article Processing Charge (APC) for finalized research."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Track', href: '/track' },
                    { name: 'Payment', href: `/payment/${id}` },
                ]}
            />

            <div className="container-responsive py-12 sm:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Invoice Left */}
                    <div className="lg:col-span-7 space-y-12">
                        <section className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-8 sm:p-10 border-b border-border/50 bg-muted/20">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <Badge className="bg-[#000066]/5 text-[#000066] border-[#000066]/20 px-3 h-6 text-[10px] font-bold tracking-wider uppercase">Official Invoice</Badge>
                                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Date: {new Date().toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-primary m-0 leading-tight">{manuscript.title}</h3>
                                <div className="flex items-center gap-3 text-muted-foreground pt-4">
                                    <TrendingUp className="w-4 h-4 text-secondary/60" />
                                    <span className="text-xs font-medium">Manuscript ID: {manuscript.paper_id}</span>
                                </div>
                            </div>

                            <div className="p-8 sm:p-10 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Beneficiary</p>
                                        <p className="text-base font-semibold text-primary m-0">{manuscript.author_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Currency Profile</p>
                                        <p className="text-base font-semibold text-primary m-0">INR (₹) - Unified Settlement</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-border/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Article Processing Fee (85%)</span>
                                        <span className="font-semibold text-primary">₹ {apcFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Global Indexing Fee (15%)</span>
                                        <span className="font-semibold text-primary">₹ {apcIndexing.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-8 mt-4 border-t border-dashed border-border/50">
                                        <span className="text-base font-bold text-primary tracking-widest uppercase">Total Due</span>
                                        <span className="text-3xl font-bold text-[#000066]">₹ {apcTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="p-8 bg-[#000066] rounded-xl text-white relative overflow-hidden shadow-sm">
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 text-white">
                                    <ShieldAlert className="w-7 h-7" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-base font-semibold m-0">No Refund Policy</h4>
                                    <p className="text-white/60 text-xs leading-relaxed border-l-2 border-white/20 pl-6">
                                        Submission of payment constitutes final agreement. Transactions are non-reversible according to ethics standards.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Action Right */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-32 space-y-12">
                            <section className="bg-card border border-border/50 rounded-xl shadow-sm p-8 text-center space-y-8 border-l-4 border-l-secondary">
                                <div className="w-16 h-16 bg-secondary/5 rounded-xl flex items-center justify-center mx-auto text-secondary border border-secondary/10">
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-primary m-0">Secure Settlement</h3>
                                    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-50">256-Bit SSL Active</p>
                                </div>

                                {apcTotal > 0 ? (
                                    <RazorpayPayment
                                        submissionId={manuscript.id}
                                        paperId={manuscript.paper_id}
                                    />
                                ) : (
                                    <p className="text-xs font-semibold text-muted-foreground">No payment required.</p>
                                )}

                                <div className="flex items-center justify-center gap-4 pt-2 opacity-30">
                                    <span className="text-[10px] font-bold tracking-widest uppercase">VISA</span>
                                    <span className="text-[10px] font-bold tracking-widest uppercase">MC</span>
                                    <span className="text-[10px] font-bold tracking-widest uppercase">UPI</span>
                                </div>
                            </section>

                            <section className="p-6 bg-muted/20 border border-border/50 rounded-xl flex items-start gap-5 relative overflow-hidden">
                                <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center shrink-0 shadow-sm text-primary border border-border/50">
                                    <Handshake className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Support Desk</h4>
                                    <p className="text-xs text-muted-foreground/60 leading-relaxed font-medium m-0">
                                        For disputes or bulk requests, contact <span className="text-secondary font-semibold">{settings.support_email}</span>.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
