"use client";

export const dynamic = "force-dynamic";

import { Save, Globe, FileText, Upload, Shield, CreditCard, Headphones, Sparkles, Layout, ExternalLink } from 'lucide-react';
import { useSettings, useUpdateSettings } from '@/hooks/queries/useSettings';
import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            staggerChildren: 0.1,
            duration: 0.8,
            ease: "circOut" 
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

export default function SystemSettings() {
    const { data: settings = {}, isLoading: loading } = useSettings();
    const updateSettingsMutation = useUpdateSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateSettingsMutation.mutateAsync(formData);

            if (result.success) {
                toast.success("System Synchronized", {
                    description: "Core environment successfully synchronized & architectural assets locked."
                });
            } else {
                toast.error("Synchronization Failed", {
                    description: result.error || "Failed to update core environment."
                });
            }
        } catch (error) {
            toast.error("Synchronization Error", {
                description: "An unexpected error occurred during synchronization."
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
                        <div className="absolute inset-0 w-20 h-20 -m-2 blur-xl bg-primary/20 animate-pulse rounded-full" />
                    </div>
                    <p className="opacity-40 animate-pulse">Accessing System Core...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.section 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12"
        >
            <form onSubmit={handleSave} className="space-y-12">
                {/* Header Section */}
                <motion.header 
                    variants={itemVariants}
                    className="relative group p-8 sm:p-12 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-sm overflow-hidden"
                >
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
                        <div className="space-y-4">
                            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5 text-[10px] font-black tracking-[0.2em] uppercase">
                                Root Administrator Console
                            </Badge>
                            <h1 className="text-primary">
                                System <span className="underline decoration-primary/10 underline-offset-8">Settings</span>
                            </h1>
                            <p className="opacity-40">
                                Configure the bedrock parameters of your journal environment.
                            </p>
                        </div>
                        <div className="flex gap-4 shrink-0">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="h-16 xl:h-18 px-10 xl:px-14 gap-3 bg-primary text-white font-black text-[10px] xl:text-xs tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group/save"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 group-hover/save:rotate-12 transition-transform" />
                                )}
                                {isSaving ? "SYNCING..." : "SYNC PREFERENCES"}
                            </Button>
                        </div>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 2xl:gap-12">
                    {/* Journal Identity */}
                    <motion.div variants={itemVariants}>
                        <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-white/50 shadow-xl rounded-[2.5rem] p-4 transition-all hover:shadow-2xl hover:shadow-primary/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center gap-5 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <Globe className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Journal Identity</CardTitle>
                                        <CardDescription className="opacity-30">Global branding & verification protocols.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Full Publication Handle</Label>
                                    <Input
                                        name="journal_name"
                                        defaultValue={settings.journal_name}
                                        className="h-16 bg-white/50 border-white/80 focus-visible:ring-primary/20 font-bold text-base shadow-sm rounded-xl px-6 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Publishing Syndicate</Label>
                                    <Input
                                        name="publisher_name"
                                        defaultValue={settings.publisher_name}
                                        className="h-16 bg-white/50 border-white/80 focus-visible:ring-primary/20 font-bold text-base shadow-sm rounded-xl px-6"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">SEO Cipher</Label>
                                        <Input
                                            name="journal_short_name"
                                            defaultValue={settings.journal_short_name}
                                            className="h-16 bg-white/50 border-white/80 focus-visible:ring-primary/20 font-black text-base shadow-sm rounded-xl px-6 tracking-widest"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">ISSN Protocol</Label>
                                        <Input
                                            name="issn_number"
                                            defaultValue={settings.issn_number}
                                            className="h-16 bg-white/50 border-white/80 focus-visible:ring-primary/20 font-black text-base font-mono shadow-sm rounded-xl px-6"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Financial Infrastructure */}
                    <motion.div variants={itemVariants}>
                        <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-white/50 shadow-xl rounded-[2.5rem] p-4 transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center gap-5 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-inner">
                                        <CreditCard className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Econometrics</CardTitle>
                                        <CardDescription className="opacity-40">Transmission fees & processing parameters.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Domestic (INR)</Label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-emerald-600/30 text-lg">₹</span>
                                            <Input
                                                name="apc_inr"
                                                defaultValue={settings.apc_inr}
                                                className="h-16 bg-white/50 border-white/80 focus-visible:ring-emerald-500/20 font-black text-xl pl-10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">International (USD)</Label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-emerald-600/30 text-lg">$</span>
                                            <Input
                                                name="apc_usd"
                                                defaultValue={settings.apc_usd}
                                                className="h-16 bg-white/50 border-white/80 focus-visible:ring-emerald-500/20 font-black text-xl pl-10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Financial Disclosure Text</Label>
                                    <Textarea
                                        name="apc_description"
                                        defaultValue={settings.apc_description}
                                        rows={4}
                                        className="bg-white/50 border-white/80 focus-visible:ring-emerald-500/20 font-medium text-sm p-6 rounded-xl resize-none min-h-[140px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Operational Support */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="group relative overflow-hidden bg-white/40 backdrop-blur-md border border-white/50 shadow-lg rounded-[2.5rem] p-4 transition-all hover:shadow-2xl hover:shadow-amber-500/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center gap-5 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-inner">
                                        <Headphones className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Operations Center</CardTitle>
                                        <CardDescription className="opacity-40">Support pathways & physical HQ logistics.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Editorial Council Inbox</Label>
                                        <Input
                                            name="support_email"
                                            defaultValue={settings.support_email}
                                            className="h-16 bg-white/50 border-white/80 focus-visible:ring-amber-500/20 font-bold text-base rounded-xl px-6"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">Direct Operations Phone</Label>
                                        <Input
                                            name="support_phone"
                                            defaultValue={settings.support_phone}
                                            className="h-16 bg-white/50 border-white/80 focus-visible:ring-amber-500/20 font-bold text-base rounded-xl px-6"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-primary/60 tracking-[0.2em] px-1 uppercase">HQ Physical Architecture</Label>
                                    <Textarea
                                        name="office_address"
                                        defaultValue={settings.office_address}
                                        rows={3}
                                        className="bg-white/50 border-white/80 focus-visible:ring-amber-500/20 font-bold text-base p-6 rounded-xl resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Resources */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="group relative bg-white shadow-2xl rounded-[3rem] border border-slate-100 overflow-hidden">
                            <CardHeader className="p-10 pb-6 border-b border-slate-50">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                                        <Layout className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Asset Repository</CardTitle>
                                        <CardDescription className="opacity-40">Manage downloadable templates & legal covenants.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Template Asset */}
                                    <div className="group/asset bg-slate-50/50 p-8 rounded-4xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="space-y-2">
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-black text-[9px] tracking-widest uppercase rounded-lg px-3 py-1">
                                                    MS-DOCX / PDF
                                                </Badge>
                                                <h4>Blueprints Dossier</h4>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                        </div>
                                        
                                        <div className="relative group/field h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:border-blue-300 hover:bg-blue-50/30 overflow-hidden">
                                            <Input
                                                type="file"
                                                name="template_url"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20 h-full w-full"
                                            />
                                            <Upload className="w-8 h-8 text-slate-300 group-hover/field:text-blue-500 group-hover/field:scale-110 transition-all" />
                                            <span className="opacity-40 group-hover/field:text-blue-600">Select New Asset</span>
                                        </div>

                                        {settings.template_url && (
                                            <div className="mt-6 flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <p className="truncate opacity-60">{settings.template_url.split('/').pop()}</p>
                                                </div>
                                                <Button asChild variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                                    <a href={settings.template_url} target="_blank" title="Download Template"><ExternalLink className="w-4 h-4" /></a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Copyright Asset */}
                                    <div className="group/asset bg-slate-50/50 p-8 rounded-4xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="space-y-2">
                                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-black text-[9px] tracking-widest uppercase rounded-lg px-3 py-1">
                                                    Legal Covenant
                                                </Badge>
                                                <h4>Copyright Protocol</h4>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                                                <Shield className="w-6 h-6" />
                                            </div>
                                        </div>
                                        
                                        <div className="relative group/field h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:border-indigo-300 hover:bg-indigo-50/30 overflow-hidden">
                                            <Input
                                                type="file"
                                                name="copyright_url"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20 h-full w-full"
                                            />
                                            <Upload className="w-8 h-8 text-slate-300 group-hover/field:text-indigo-500 group-hover/field:scale-110 transition-all" />
                                            <span className="opacity-40 group-hover/field:text-indigo-600">Select New Asset</span>
                                        </div>

                                        {settings.copyright_url && (
                                            <div className="mt-6 flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <p className="truncate opacity-60">{settings.copyright_url.split('/').pop()}</p>
                                                </div>
                                                <Button asChild variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600">
                                                    <a href={settings.copyright_url} target="_blank" title="Download Copyright Protocol"><ExternalLink className="w-4 h-4" /></a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Promotion Control */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="relative overflow-hidden bg-white/40 backdrop-blur-md border border-white/50 shadow-lg rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="absolute top-0 left-0 w-2 h-full bg-purple-500/20" />
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xl border border-purple-100 shrink-0 rotate-3">
                                    <Sparkles className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3>Growth Protocol <span className="opacity-40 text-sm ml-2">v2.4</span></h3>
                                    <p className="opacity-40 max-w-md">Override global promotion modules for landing zones & user dash interfaces.</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                                <select
                                    name="is_promotion_active"
                                    defaultValue={settings.is_promotion_active || "true"}
                                    aria-label="Promotion Module Status"
                                    className="h-16 w-full sm:w-64 rounded-2xl bg-white border border-slate-100 px-6 py-2 text-sm font-black tracking-widest uppercase transition-all shadow-xl text-primary cursor-pointer outline-none ring-offset-background focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="true">Active Transmission</option>
                                    <option value="false">Silent Protocol</option>
                                </select>
                                <div className="hidden sm:flex flex-col text-right">
                                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-purple-600">Auto-Saving Disabled</span>
                                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-300">Requires Sync Preferences</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </form>
        </motion.section>
    );
}
