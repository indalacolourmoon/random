'use client'

import { CreditCard, ShieldCheck, Lock, ChevronLeft, Info, Loader2, CheckCircle2, AlertCircle, TrendingUp, Handshake, ShieldAlert, ArrowRight } from 'lucide-react';
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
    const manuscript = queryData && 'manuscript' in queryData ? queryData.manuscript : null;
    const [processing, setProcessing] = useState(false);
    const [paid, setPaid] = useState(false);

    const error = queryError ? "Failed to fetch manuscript details." : (queryData && 'error' in queryData ? queryData.error : (!manuscript && !loading ? "Manuscript not found or invalid link." : ""));

    // Real payment is handled by the RazorpayPayment component
    // handlePayment removed as it was a mock

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/5 rounded-full animate-spin border-t-secondary" />
                    <Loader2 className="w-8 h-8 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="font-black text-primary/40  tracking-[0.4em] text-[10px] animate-pulse">Authenticating Secure Session</p>
            </div>
        </div>
    );

    if (error || (manuscript && manuscript.status !== 'accepted' && manuscript.status !== 'published')) return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-xl w-full bg-white border border-primary/5 rounded-[3.5rem] text-center p-12 sm:p-20 shadow-sm border-l-[6px] border-l-destructive/20 transition-all hover:shadow-xl group">
                <div className="w-20 h-20 bg-destructive/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-destructive group-hover:bg-destructive group-hover:text-white transition-all duration-700">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                    <h2 className="font-black text-primary tracking-widest uppercase ">Authentication Failed</h2>
                    <p className="text-sm text-primary/40 font-medium leading-relaxed ">
                        The provided manuscript credentials could not be verified for active payment processing. Please synchronize with the editorial desk.
                    </p>
                </div>
                <Button asChild className="h-14 mt-10 px-10 bg-primary hover:bg-primary/95 text-white font-black  tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all">
                    <Link href="/track">Return to Portal</Link>
                </Button>
            </div>
        </div>
    );

    if (paid || (manuscript && manuscript.status === 'published')) return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-xl w-full bg-white border border-primary/5 rounded-[3.5rem] text-center p-12 sm:p-20 shadow-sm border-l-[6px] border-l-secondary transition-all hover:shadow-xl group">
                <div className="w-20 h-20 bg-secondary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-700">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                    <h2 className="font-black text-primary tracking-widest uppercase ">Legacy Secured</h2>
                    <p className="text-sm text-primary/40 font-medium leading-relaxed ">
                        Grant processed successfully. Your research is now officially queued for global indexing and long-term digital preservation.
                    </p>
                </div>
                <div className="pt-10 space-y-4">
                    <Button asChild className="h-14 w-full bg-primary hover:bg-primary/95 text-white font-black  tracking-[0.2em] text-xs rounded-2xl shadow-xl">
                        <Link href="/">Return Home</Link>
                    </Button>
                    <p className="text-[10px] font-black  tracking-widest text-primary/20 animate-pulse">Session finalized • Encrypted</p>
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
                description="Secure Article Processing Fee (APC) for finalized research."
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
                        <section className="bg-white border border-primary/5 rounded-[2.5rem] shadow-sm overflow-hidden border-l-[6px] border-l-primary/10 transition-all hover:shadow-xl">
                            <div className="p-10 sm:p-14 border-b border-primary/5 bg-primary/[0.02]">
                                <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                                    <Badge className="bg-primary/5 text-primary border-primary/10 px-4 h-6 text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black tracking-widest uppercase">Official Invoice</Badge>
                                    <span className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-primary/40 tracking-widest uppercase">Date: {new Date().toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-black text-primary tracking-widest leading-wider mb-4 uppercase">{manuscript.title}</h3>
                                <div className="flex items-center gap-4 text-primary/50 font-black  tracking-widest text-[11px]">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-secondary" />
                                    </div>
                                    Manuscript ID: {manuscript.paper_id}
                                </div>
                            </div>

                            <div className="p-10 sm:p-14 space-y-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-primary/30  tracking-[0.3em]">Beneficiary</p>
                                        <p className="text-base font-black text-primary ">{manuscript.author_name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-primary/30  tracking-[0.3em]">Currency Profile</p>
                                        <p className="text-base font-black text-primary">INR (₹) - Unified Settlement</p>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-10 border-t border-primary/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-primary/40  tracking-widest">Core APC (85%)</span>
                                        <span className="text-sm font-black text-primary/60">₹ {apcFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-primary/40  tracking-widest">Metadata Proxy & Indexing (15%)</span>
                                        <span className="text-sm font-black text-primary/60">₹ {apcIndexing.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-10 mt-6 border-t-2 border-dashed border-primary/10">
                                        <span className="text-base font-black text-primary  tracking-[0.2em]">Total Due</span>
                                        <span className="text-4xl font-black text-secondary tracking-widerer">₹ {apcTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="p-10 sm:p-14 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                    <ShieldAlert className="w-8 h-8 text-secondary" />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-black tracking-wider ">Zero Refund Protocol</h4>
                                    <p className="text-white/50 text-xs font-medium leading-relaxed  border-l-2 border-secondary/50 pl-6">
                                        "Submission of payment constitutes final agreement for global dissemination. Once article is processed, transactions are non-reversible according to COPE integrity standards."
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Action Right */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-32 space-y-12">
                            <section className="bg-white border border-primary/5 rounded-[3rem] shadow-sm p-10 sm:p-14 text-center space-y-10 border-l-[6px] border-l-secondary transition-all hover:shadow-xl">
                                <div className="w-20 h-20 bg-secondary/5 rounded-3xl flex items-center justify-center mx-auto text-secondary border border-secondary/10">
                                    <CreditCard className="w-10 h-10" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-black text-primary tracking-wider ">Secure Settlement</h3>
                                    <p className="text-[10px] font-black  tracking-[0.3em] text-primary/40 ">256-Bit SSL Encryption Active</p>
                                </div>

                                {apcTotal > 0 ? (
                                    <RazorpayPayment
                                        submissionId={manuscript.id}
                                        paperId={manuscript.paper_id}
                                    />
                                ) : (
                                    <p className="text-[10px] font-black text-primary/60">No payment required for this manuscript.</p>
                                )}

                                <div className="flex items-center justify-center gap-6 pt-4 grayscale opacity-40">
                                    <div className="w-10 h-6 bg-primary/10 rounded flex items-center justify-center text-[8px] font-black tracking-widerer">VISA</div>
                                    <div className="w-10 h-6 bg-primary/10 rounded flex items-center justify-center text-[8px] font-black tracking-widerer">MC</div>
                                    <div className="w-10 h-6 bg-primary/10 rounded flex items-center justify-center text-[8px] font-black tracking-widerer">UPI</div>
                                </div>
                            </section>

                            <section className="p-8 bg-primary/5 rounded-[2.5rem] flex items-start gap-6 relative group overflow-hidden">
                                <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-primary">
                                    <Handshake className="w-6 h-6" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h4 className="text-[9px] sm:text-[10px] xl:text-[11px] font-black text-primary tracking-[0.3em] uppercase">Support Desk</h4>
                                    <p className="text-[11px] text-primary/50 font-medium leading-relaxed ">
                                        For transaction disputes or bulk processing requests, please contact our financial desk at <span className="text-secondary">{settings.support_email}</span>.
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
