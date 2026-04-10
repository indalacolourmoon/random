"use client";
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, FileText, ImageIcon, Loader2, ChevronRight, ChevronLeft, Building2, Plus } from 'lucide-react';
import { checkUserEmail } from '@/actions/users';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { toast } from 'sonner';
import { useReviewerApplicationMutation } from '@/hooks/queries/usePublicMutations';

const PREDEFINED_INTERESTS = [
    "AI/ML", "VLSI", "Renewable Energy", "Biomedical Engineering",
    "Cybersecurity", "Data Science", "IoT", "Signal Processing",
    "Environmental Engineering", "Civil Infrastructure"
];

function FileInput({
    name,
    label,
    accept,
    icon: Icon,
    onChange,
    value
}: {
    name: string;
    label: string;
    accept: string;
    icon: any;
    onChange: (file: File | null) => void;
    value: File | null;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
    }, [onChange]);

    return (
        <div className="space-y-2">
            <Label className="text-[#000066] text-[11px] font-bold uppercase tracking-wider pl-1">
                {label} <span className="text-destructive">*</span>
            </Label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    relative group cursor-pointer overflow-hidden
                    border-2 border-dashed rounded-xl p-6
                    transition-all duration-200
                    ${value
                        ? 'border-[#000066]/50 bg-[#000066]/5'
                        : 'border-border/50 bg-card hover:border-[#000066]/30 hover:bg-[#000066]/5'
                    }
                `}
            >
                <input
                    title='application file'
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-4 relative z-10 text-center">
                    <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm border
                        ${value ? 'bg-[#000066] text-white border-[#000066]' : 'bg-muted/20 text-[#000066]/40 border-border/50'}
                    `}>
                        {value ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                        <p className={`text-xs font-semibold truncate max-w-[200px] ${value ? 'text-[#000066]' : 'text-foreground'}`}>
                            {value ? value.name : `Select ${label}`}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60">
                            {value ? "File selected" : accept.replace(/\./g, ' ')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReviewerApplicationForm() {
    const reviewerMutation = useReviewerApplicationMutation();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0); // 1 for forward, -1 for back


    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        designation: '',
        email: '',
        institute: '',
        nationality: 'India',
        researchInterests: [] as string[],
        cv: null as File | null,
        photo: null as File | null
    });

    const [customInterest, setCustomInterest] = useState('');
    const [emailStatus, setEmailStatus] = useState<{ loading: boolean; exists: boolean | null }>({ loading: false, exists: null });

    // Step 1: Academic Identity Email Check
    useEffect(() => {
        if (!formData.email || formData.email.length < 5 || !formData.email.includes('@')) {
            setEmailStatus({ loading: false, exists: null });
            return;
        }

        const timeoutId = setTimeout(async () => {
            setEmailStatus({ loading: true, exists: null });
            const result = await checkUserEmail(formData.email);
            setEmailStatus({ loading: false, exists: !!result.exists });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.email]);

    const handleNext = useCallback(() => {
        // Validation per step
        if (step === 1) {
            if (!formData.fullName || !formData.designation || !formData.email || emailStatus.exists) {
                toast.error("Please provide valid info.");
                return;
            }
        }
        if (step === 2) {
            if (!formData.institute || !formData.nationality || formData.researchInterests.length === 0) {
                toast.error("Please add research info.");
                return;
            }
        }

        setDirection(1);
        setStep(prev => Math.min(prev + 1, 3));
    }, [step, formData, emailStatus.exists]);

    const handleBack = useCallback(() => {
        setDirection(-1);
        setStep(prev => Math.max(prev - 1, 1));
    }, []);

    const toggleInterest = useCallback((interest: string) => {
        setFormData(prev => ({
            ...prev,
            researchInterests: prev.researchInterests.includes(interest)
                ? prev.researchInterests.filter(i => i !== interest)
                : [...prev.researchInterests, interest]
        }));
    }, []);

    const addCustomInterest = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = customInterest.trim();
        if (trimmed) {
            setFormData(prev => {
                if (prev.researchInterests.includes(trimmed)) return prev;
                return {
                    ...prev,
                    researchInterests: [...prev.researchInterests, trimmed]
                };
            });
            setCustomInterest('');
        }
    }, [customInterest]);

    const handleSubmit = useCallback(async () => {
        if (!formData.cv || !formData.photo) {
            toast.error("CV and Photo are required.");
            return;
        }

        const submissionData = new FormData();
        submissionData.append('application_type', 'reviewer');
        submissionData.append('fullName', formData.fullName);
        submissionData.append('designation', formData.designation);
        submissionData.append('email', formData.email);
        submissionData.append('institute', formData.institute);
        submissionData.append('nationality', formData.nationality);
        submissionData.append('cv', formData.cv);
        submissionData.append('photo', formData.photo);
        submissionData.append('research_interests', JSON.stringify(formData.researchInterests));

        reviewerMutation.mutate(submissionData);
    }, [formData, reviewerMutation]);

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (dir: number) => ({
            zIndex: 0,
            x: dir < 0 ? 50 : -50,
            opacity: 0
        })
    };

    if (reviewerMutation.isSuccess) {
        return (
            <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-[#000066]/5 text-[#000066] rounded-xl flex items-center justify-center border border-[#000066]/10 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Application Received</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        Thank you for your interest. Our editorial team will review your credentials and contact you soon.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    <div className="p-4 bg-muted/20 rounded-lg border border-border/50 text-left">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Applicant</p>
                        <p className="text-xs font-semibold text-[#000066] truncate">{formData.fullName}</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg border border-border/50 text-left">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</p>
                        <p className="text-xs font-semibold text-[#000066]">Under Review</p>
                    </div>
                </div>

                <Button onClick={() => window.location.reload()} variant="outline" className="h-10 px-6 rounded-lg border-border/50 text-[#000066] hover:bg-[#000066]/5 font-semibold text-xs transition-all">
                    Return
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border/50 rounded-xl shadow-sm transition-all flex flex-col min-h-[550px] overflow-hidden">
            {/* Header Stepper */}
            <div className="bg-[#000066] p-6 text-white relative">
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold text-white mb-6">Reviewer Application</h2>
                    
                    <div className="w-full max-w-xs flex items-center justify-between relative px-2">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="relative z-10 flex flex-col items-center gap-1.5">
                                <div className={`
                                    w-7 h-7 rounded-lg flex items-center justify-center border text-[11px] font-bold transition-all
                                    ${step >= s ? 'bg-white text-[#000066] border-white' : 'bg-[#000066] border-white/20 text-white/40'}
                                `}>
                                    {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${step >= s ? 'text-white' : 'text-white/30'}`}>
                                    {s === 1 ? 'Info' : s === 2 ? 'Research' : 'Files'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
                <div className="relative flex-1 px-1">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            className="w-full"
                        >
                            {step === 1 && (
                                <div className="space-y-6">
                                    <header className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-[#000066]/5 text-[#000066] border-[#000066]/10 text-[10px] font-bold uppercase py-0 px-2 rounded-md">Phase 01</Badge>
                                            <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
                                        </div>
                                    </header>

                                    <div className="grid grid-cols-1 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-[#000066] text-[11px] font-bold uppercase tracking-wider pl-1 font-bold">Full Name <span className="text-destructive">*</span></Label>
                                            <Input
                                                value={formData.fullName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                required
                                                className="h-11 bg-muted/20 border-border/50 rounded-lg text-foreground px-4 text-xs xl:text-sm"
                                                placeholder="e.g. Dr. Alexander Vance"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#000066] text-[11px] font-bold uppercase tracking-wider pl-1 font-bold">Designation <span className="text-destructive">*</span></Label>
                                            <Input
                                                value={formData.designation}
                                                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                                                required
                                                className="h-11 bg-muted/20 border-border/50 rounded-lg text-foreground px-4 text-xs xl:text-sm"
                                                placeholder="e.g. Associate Professor"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between px-1">
                                                <Label className="text-[#000066] text-[11px] font-bold uppercase tracking-wider font-bold">Email Address <span className="text-destructive">*</span></Label>
                                                {emailStatus.loading && <Loader2 className="w-3 h-3 animate-spin text-[#000066]" />}
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    className={`h-11 rounded-lg px-4 bg-muted/20 text-xs xl:text-sm ${emailStatus.exists ? 'border-destructive/50 bg-destructive/5' : 'border-border/50'}`}
                                                    placeholder="vance@university.edu"
                                                />
                                                {emailStatus.exists && (
                                                    <p className="text-[10px] font-bold text-destructive uppercase px-1 mt-1">
                                                        Email already registered.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <header className="space-y-1">
                                         <div className="flex items-center gap-2">
                                            <Badge className="bg-[#000066]/5 text-[#000066] border-[#000066]/10 text-[10px] font-bold uppercase py-0 px-2 rounded-md">Phase 02</Badge>
                                            <h3 className="text-base font-semibold text-gray-900">Academic Context</h3>
                                        </div>
                                    </header>

                                    <div className="grid grid-cols-1 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-[#000066] text-[11px] font-bold uppercase tracking-wider pl-1 font-bold">Institution <span className="text-destructive">*</span></Label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-[#000066] transition-colors" />
                                                <Input
                                                    value={formData.institute}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, institute: e.target.value }))}
                                                    required
                                                    className="h-11 bg-muted/20 border-border/50 pl-11 pr-4 rounded-lg text-foreground text-xs xl:text-sm"
                                                    placeholder="University Name"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#000066] text-[11px] font-bold uppercase tracking-wider pl-1 font-bold">Nationality <span className="text-destructive">*</span></Label>
                                            <Select value={formData.nationality} onValueChange={(val) => setFormData(prev => ({ ...prev, nationality: val }))}>
                                                <SelectTrigger className="h-11 bg-muted/20 border-border/50 rounded-lg text-foreground px-4 text-xs xl:text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-80 rounded-xl">
                                                    {countries.map(c => (
                                                        <SelectItem key={c.code} value={c.name} className="py-2.5 rounded-lg text-xs">
                                                            <div className="flex items-center gap-3">
                                                                <Image 
                                                                    src={getFlagUrl(c.name)} 
                                                                    alt={`${c.name} flag`} 
                                                                    width={18} 
                                                                    height={12} 
                                                                    className="object-cover rounded shadow-sm shrink-0" 
                                                                />
                                                                <span className="text-foreground">{c.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[#000066] text-[11px] font-bold uppercase tracking-wider pl-1 font-bold">Research Interests <span className="text-destructive">*</span></Label>
                                            
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {PREDEFINED_INTERESTS.map(tag => (
                                                    <Badge
                                                        key={tag}
                                                        onClick={() => toggleInterest(tag)}
                                                        variant="outline"
                                                        className={`
                                                            cursor-pointer py-1.5 px-3 rounded-lg transition-all text-[10px] font-bold uppercase tracking-tight
                                                            ${formData.researchInterests.includes(tag) 
                                                                ? 'bg-[#000066] text-white border-[#000066] shadow-sm' 
                                                                : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-[#000066]/30 hover:text-[#000066]'}
                                                        `}
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="relative group">
                                                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                                                <Input
                                                    value={customInterest}
                                                    onChange={(e) => setCustomInterest(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addCustomInterest(e)}
                                                    placeholder="Other interests..."
                                                    className="h-11 bg-muted/20 border-border/50 pl-11 pr-28 rounded-lg text-foreground text-xs xl:text-sm"
                                                />
                                                <Button 
                                                    type="button"
                                                    onClick={() => addCustomInterest()}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 bg-[#000066] text-white px-4 rounded-md text-[10px] font-bold uppercase"
                                                >
                                                    Add
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {formData.researchInterests.filter(i => !PREDEFINED_INTERESTS.includes(i)).map(tag => (
                                                    <Badge key={tag} className="bg-[#000066]/5 text-[#000066] border border-[#000066]/10 flex items-center gap-2 py-1 px-3 rounded-lg text-[10px] font-bold uppercase">
                                                        {tag} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleInterest(tag)} />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <header className="space-y-1">
                                         <div className="flex items-center gap-2">
                                            <Badge className="bg-[#000066]/5 text-[#000066] border-[#000066]/10 text-[10px] font-bold uppercase py-0 px-2 rounded-md">Phase 03</Badge>
                                            <h3 className="text-base font-semibold text-gray-900">Documents</h3>
                                        </div>
                                    </header>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FileInput
                                            name="cv"
                                            label="CV"
                                            accept=".pdf,.doc,.docx"
                                            icon={FileText}
                                            value={formData.cv}
                                            onChange={(file) => setFormData(p => ({ ...p, cv: file }))}
                                        />
                                        <FileInput
                                            name="photo"
                                            label="Photo"
                                            accept=".jpg,.jpeg,.png"
                                            icon={ImageIcon}
                                            value={formData.photo}
                                            onChange={(file) => setFormData(p => ({ ...p, photo: file }))}
                                        />
                                    </div>

                                    <aside className="p-4 bg-muted/20 border border-border/50 rounded-lg flex gap-3">
                                        <AlertCircle className="w-4 h-4 text-[#000066]/40 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-[#000066] uppercase">Verification</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 leading-relaxed">
                                                I verify the authenticity of the documents provided.
                                            </p>
                                        </div>
                                    </aside>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-border/50 pt-6">
                    {step > 1 ? (
                        <Button 
                            onClick={handleBack}
                            variant="ghost" 
                            className="h-10 px-6 rounded-lg text-muted-foreground/60 hover:text-[#000066] font-bold text-[10px] uppercase tracking-wider transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button 
                            onClick={handleNext}
                            className="h-10 px-8 bg-[#000066] text-white rounded-lg shadow-sm hover:bg-[#000088] font-bold text-[10px] uppercase tracking-wider transition-all"
                        >
                            Continue <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit}
                            disabled={reviewerMutation.isPending}
                            className="h-10 px-8 bg-[#000066] text-white rounded-lg shadow-md hover:bg-[#000088] font-bold text-[10px] uppercase tracking-wider transition-all"
                        >
                            {reviewerMutation.isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Processing...
                                </>
                            ) : (
                                <>
                                    Submit
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
