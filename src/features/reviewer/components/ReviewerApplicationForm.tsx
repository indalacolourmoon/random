"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Upload, X, CheckCircle2, AlertCircle, FileText, ImageIcon, Loader2, ChevronRight } from 'lucide-react';
import { submitReviewerApplication } from '@/actions/reviewer';
import { checkUserEmail } from '@/actions/users';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { countries, getFlagUrl } from "@/lib/countries";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function FileInput({
    name,
    label,
    accept,
    icon: Icon
}: {
    name: string;
    label: string;
    accept: string;
    icon: any;
}) {
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFileName(file ? file.name : null);
    };

    return (
        <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm text-primary/60 tracking-widest pl-1 uppercase font-black">
                {label} <span className="text-secondary">*</span>
            </Label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    relative group cursor-pointer overflow-hidden
                    border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6
                    transition-all duration-500
                    ${fileName
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 bg-slate-50 hover:border-primary/20 hover:bg-white'
                    }
                `}
            >
                <input
                    ref={inputRef}
                    placeholder="Upload File"
                    type="file"
                    name={name}
                    accept={accept}
                    required
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                    <div className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm border border-slate-100
                        ${fileName ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-white text-primary/40 group-hover:rotate-12 group-hover:text-primary group-hover:border-primary/20'}
                    `}>
                        {fileName ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm truncate ${fileName ? 'text-emerald-700' : 'text-primary/80 group-hover:text-primary transition-colors'}`}>
                            {fileName || "upload"}
                        </p>
                        <p className={`text-xs font-black tracking-widest uppercase ${fileName ? 'text-emerald-600/60' : 'text-primary/40 group-hover:text-primary/60 transition-colors'}`}>
                            {fileName ? "Asset Synchronized" : accept.replace(/\./g, ' ').toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubmitButton({ disabled, pending }: { disabled?: boolean; pending: boolean }) {
    return (
        <Button
            type="submit"
            disabled={pending || disabled}
            className="w-full h-14 sm:h-16 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-xs tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all group/btn uppercase"
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2 sm:mr-3" />
                    <span>Confirming Details...</span>
                </>
            ) : (
                <div className="flex items-center gap-2 sm:gap-3 text-xs md:text-base">
                    <span>Submit Application</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
                </div>
            )}
        </Button>
    );
}

import { toast } from 'sonner';

import { useReviewerApplicationMutation } from '@/hooks/queries/usePublicMutations';

export default function ReviewerApplicationForm() {
    const reviewerMutation = useReviewerApplicationMutation();
    const [activeTab, setActiveTab] = useState<'reviewer' | 'editor'>('reviewer');
    const [email, setEmail] = useState('');
    const [emailStatus, setEmailStatus] = useState<{ loading: boolean; exists: boolean | null }>({ loading: false, exists: null });

    useEffect(() => {
        if (!email || email.length < 5 || !email.includes('@')) {
            setEmailStatus({ loading: false, exists: null });
            return;
        }

        const timeoutId = setTimeout(async () => {
            setEmailStatus({ loading: true, exists: null });
            const result = await checkUserEmail(email);
            setEmailStatus({ loading: false, exists: !!result.exists });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [email]);

    async function handleSubmit(formData: FormData) {
        if (emailStatus.exists) return;
        formData.append('application_type', activeTab);
        reviewerMutation.mutate(formData);
    }

    if (reviewerMutation.isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-primary/5 text-center overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-8 sm:p-12 text-primary/5 pointer-events-none">
                    <CheckCircle2 className="w-32 h-32 sm:w-48 sm:h-48" />
                </div>
                <div className="relative z-10">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner border border-emerald-100">
                        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500" />
                    </div>
                    <h2 className=" font-black text-primary tracking-widest mb-4">Transmission <span className="text-secondary">Confirmed</span></h2>
                    <p className="text-sm sm:text-base text-primary/60 font-medium mb-8 sm:mb-10 max-w-md mx-auto">
                        {activeTab === 'reviewer'
                            ? "Your dossier has been successfully transmitted to our evaluation council for rigorous screening."
                            : "Your editorial profile is now being processed by our publication orchestration team."
                        }
                    </p>
                    <div className="p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-100 inline-block text-left shadow-inner w-full sm:w-auto">
                        <Badge variant="secondary" className="text-xs font-black tracking-widest bg-white text-primary px-3 h-6 mb-4 shadow-sm">Next Protocol Steps</Badge>
                        <ul className="space-y-4 text-xs font-black tracking-widest text-primary/60">
                            <li className="flex items-center gap-3">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                Editorial Screening (24-48 hours)
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                Official Invitation via Encryption
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                Board Onboarding & Credentials
                            </li>
                        </ul>
                    </div>
                    <Button onClick={() => reviewerMutation.reset()} variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black text-xs tracking-widest mt-8">Apply Again</Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-primary/5 overflow-hidden">
            <div className="bg-gradient-to-br from-primary via-primary to-primary/80 p-6 sm:p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-white/10 pointer-events-none">
                    <FileText className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 opacity-10" />
                </div>
                <div className="relative z-10 space-y-2">
                    <p className="text-lg sm:text-xl md:text-3xl font-black text-white text-center tracking-widest uppercase -mt-1 sm:-mt-2">
                        {activeTab === 'reviewer' ? 'Review Board' : 'Editorial Panel'}
                    </p>
                </div>
            </div>

            <div className="p-5 sm:p-6 md:p-12 pt-0 md:pt-0">
                <AnimatePresence mode='wait'>
                    {reviewerMutation.isError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 p-4 bg-secondary/5 border border-secondary/10 text-secondary rounded-xl text-xs font-black tracking-widest flex items-center gap-3"
                        >
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            {reviewerMutation.error?.message || "Failed to submit application."}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form action={handleSubmit} className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-2 sm:space-y-3">
                            <Label className="text-xs sm:text-sm text-primary/80 tracking-widest pl-1 uppercase font-black">Full Identity <span className="text-secondary">*</span></Label>
                            <Input
                                name="fullName"
                                type="text"
                                required
                                className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl sm:rounded-2xl font-bold text-primary focus-visible:ring-primary/20 focus-visible:border-primary/50 shadow-sm px-4 sm:px-6 transition-all placeholder:text-black/30"
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <Label className="text-xs sm:text-sm text-primary/80 tracking-widest uppercase font-black pl-1">Professional Status <span className="text-secondary">*</span></Label>
                            <Input
                                name="designation"
                                type="text"
                                required
                                className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl sm:rounded-2xl font-bold text-primary focus-visible:ring-primary/20 focus-visible:border-primary/50 shadow-sm px-4 sm:px-6 transition-all placeholder:text-black/30"
                                placeholder="Associate Professor"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <Label className="text-xs sm:text-sm text-primary/80 tracking-widest uppercase font-black pl-1">Institutional Provenance <span className="text-secondary">*</span></Label>
                        <Input
                            name="institute"
                            type="text"
                            required
                            className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl sm:rounded-2xl font-bold text-primary focus-visible:ring-primary/20 focus-visible:border-primary/50 shadow-sm px-4 sm:px-6 transition-all placeholder:text-black/30"
                            placeholder="University of Advanced Engineering..."
                        />
                    </div>

                    <div className="space-y-2 sm:space-y-3 relative">
                        <Label className="text-xs sm:text-sm text-primary/80 tracking-widest uppercase font-black pl-1">Nationality <span className="text-secondary">*</span></Label>
                        <Select name="nationality" defaultValue="India">
                            <SelectTrigger className="h-12 sm:h-14 bg-white border-slate-200 rounded-xl sm:rounded-2xl font-bold text-primary focus:ring-primary/20 transition-all shadow-sm px-4 sm:px-6">
                                <SelectValue placeholder="Select Origin..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-80 rounded-2xl border-slate-100 shadow-2xl">
                                {countries.map(c => (
                                    <SelectItem key={c.code} value={c.name} className="py-3 focus:bg-primary/5 rounded-xl cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getFlagUrl(c.name)}
                                                alt=""
                                                className="w-5 h-3.5 object-cover rounded-sm shadow-sm border border-black/5"
                                            />
                                            <span className="font-bold text-primary/80 uppercase tracking-widest text-xs">{c.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between pl-1">
                            <Label className="text-xs sm:text-sm text-primary/80 tracking-widest uppercase font-black">Email <span className="text-secondary">*</span></Label>
                            {emailStatus.loading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                        </div>
                        <div className="relative">
                            <Input
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold transition-all shadow-sm px-4 sm:px-6 bg-white placeholder:text-black/30 ${emailStatus.exists
                                    ? 'border-secondary/50 focus-visible:ring-secondary/20 bg-secondary/5'
                                    : 'border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary/50'
                                    }`}
                                placeholder="email@institution.edu"
                            />
                            {emailStatus.exists && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute -bottom-6 sm:-bottom-7 left-1 flex items-center gap-1.5 text-secondary"
                                >
                                    <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    <span className="text-xs font-black tracking-widest">Identity already exists in our archives.</span>
                                </motion.div>
                            )}
                        </div>
                    </div>


                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-primary/5">
                        <FileInput
                            name="cv"
                            label="Curriculum Vitae"
                            accept=".doc,.docx,.pdf"
                            icon={FileText}

                        />
                        <FileInput
                            name="photo"
                            label="Photo"
                            accept=".jpg,.jpeg,.png"
                            icon={ImageIcon}
                        />
                    </div>

                    <div className="pt-6 sm:pt-8">
                        <SubmitButton
                            disabled={!!emailStatus.exists}
                            pending={reviewerMutation.isPending}
                        />
                        <p className="text-center mt-4 sm:mt-6 text-xs text-black tracking-widest uppercase">
                            {emailStatus.exists
                                ? "Synchronize with existing credentials instead."
                                : "Encryption protocol secured for all transmissions."
                            }
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
