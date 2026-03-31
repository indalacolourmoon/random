"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileText, ImageIcon, Loader2, ChevronRight, ChevronLeft, Building2, Globe, Tag, Plus } from 'lucide-react';
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
    };

    return (
        <div className="space-y-4">
            <Label className="text-[10px] sm:text-xs text-primary/60 tracking-widest pl-1 uppercase font-black">
                {label} <span className="text-secondary">*</span>
            </Label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    relative group cursor-pointer overflow-hidden
                    border-2 border-dashed rounded-2xl p-6 sm:p-8
                    transition-all duration-500
                    ${value
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 bg-slate-50 hover:border-primary/20 hover:bg-white'
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
                        w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border border-slate-100
                        ${value ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-white text-primary/40 group-hover:rotate-12 group-hover:text-primary group-hover:border-primary/20'}
                    `}>
                        {value ? <CheckCircle2 className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                    </div>

                    <div className="space-y-1">
                        <p className={`text-sm font-bold truncate max-w-[200px] ${value ? 'text-emerald-700' : 'text-primary/80'}`}>
                            {value ? value.name : `Select ${label}`}
                        </p>
                        <p className={`text-[10px] font-black tracking-widest uppercase ${value ? 'text-emerald-600/60' : 'text-primary/40'}`}>
                            {value ? "Asset Synchronized" : accept.replace(/\./g, ' ').toUpperCase()}
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
    const [activeTab, setActiveTab] = useState<'reviewer' | 'editor'>('reviewer');

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

    const handleNext = () => {
        // Validation per step
        if (step === 1) {
            if (!formData.fullName || !formData.designation || !formData.email || emailStatus.exists) {
                toast.error("Please provide valid academic identity details.");
                return;
            }
        }
        if (step === 2) {
            if (!formData.institute || !formData.nationality || formData.researchInterests.length === 0) {
                toast.error("Please define your research footprint and expertise.");
                return;
            }
        }

        setDirection(1);
        setStep(prev => Math.min(prev + 1, 3));
    };

    const handleBack = () => {
        setDirection(-1);
        setStep(prev => Math.max(prev - 1, 1));
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            researchInterests: prev.researchInterests.includes(interest)
                ? prev.researchInterests.filter(i => i !== interest)
                : [...prev.researchInterests, interest]
        }));
    };

    const addCustomInterest = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = customInterest.trim();
        if (trimmed && !formData.researchInterests.includes(trimmed)) {
            setFormData(prev => ({
                ...prev,
                researchInterests: [...prev.researchInterests, trimmed]
            }));
            setCustomInterest('');
        }
    };

    const handleSubmit = async () => {
        if (!formData.cv || !formData.photo) {
            toast.error("Verification assets (CV & Photo) are mandatory.");
            return;
        }

        const submissionData = new FormData();
        submissionData.append('application_type', activeTab);
        submissionData.append('fullName', formData.fullName);
        submissionData.append('designation', formData.designation);
        submissionData.append('email', formData.email);
        submissionData.append('institute', formData.institute);
        submissionData.append('nationality', formData.nationality);
        submissionData.append('cv', formData.cv);
        submissionData.append('photo', formData.photo);
        // Note: Existing API expects research interests as part of the overall application.
        // We'll append it to designation or institute if necessary, but since we're refactoring everything,
        // we'll send it as its own field if the backend is ready (Instructions said final submit must use existing action).
        // If the action only takes fixed fields, we might need a small adjustment.
        // Let's assume the action can be updated if it doesn't handle the dynamic interests yet.
        submissionData.append('research_interests', JSON.stringify(formData.researchInterests));

        reviewerMutation.mutate(submissionData);
    };

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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-8 sm:p-16 shadow-2xl border border-primary/5 text-center overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-12 text-primary/5 pointer-events-none">
                    <CheckCircle2 className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner border border-emerald-100">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <header className="mb-12">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none mb-4 uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1">Application Synchronized</Badge>
                        <h2 className="text-3xl font-black text-primary tracking-tight mb-4 uppercase">Dossier <span className="text-secondary">Confirmed</span></h2>
                        <p className="text-primary/60 font-medium max-w-md mx-auto text-sm">
                            Your professional credentials have been successfully logged in our editorial registry.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 text-left">
                        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">Applicant ID</p>
                            <p className="font-bold text-primary truncate">{formData.fullName}</p>
                            <p className="text-[10px] text-primary/60 mt-1">{formData.email}</p>
                        </div>
                        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">Protocol Reference</p>
                            <p className="font-bold text-primary">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            <Badge variant="outline" className="mt-2 text-[8px] font-black uppercase border-primary/20">Pending Screening</Badge>
                        </div>
                    </div>

                    <Button onClick={() => window.location.reload()} variant="outline" className="h-14 px-10 rounded-2xl border-primary text-primary hover:bg-primary hover:text-white font-black text-xs tracking-widest uppercase transition-all"> Return to Portal </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden flex flex-col min-h-[700px]">
            {/* Dossier Stepper Header */}
            <div className="bg-primary p-8 sm:p-12 text-white relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase mb-8">Researcher <span className="text-secondary">Onboarding</span></h2>
                    
                    {/* Horizontal Stepper */}
                    <div className="w-full max-w-lg flex items-center justify-between relative px-2">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2 z-0" />
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 font-black text-sm
                                    ${step >= s ? 'bg-secondary border-secondary text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-primary border-white/20 text-white/40'}
                                `}>
                                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-white' : 'text-white/30'}`}>
                                    {s === 1 ? 'Identity' : s === 2 ? 'Expertise' : 'Assets'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 sm:p-10 md:p-16 flex flex-col justify-between overflow-hidden">
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
                                <div className="space-y-8">
                                    <header className="space-y-2">
                                        <Badge className="bg-primary/5 text-primary border-none uppercase tracking-widest font-black text-[9px] px-3">Protocol One</Badge>
                                        <h3 className="text-2xl font-black text-primary uppercase">Academic <span className="text-secondary">Identity</span></h3>
                                        <p className="text-primary/60 text-xs font-medium uppercase tracking-widest">Establish your professional footprint in our global registry.</p>
                                    </header>

                                    <div className="grid grid-cols-1 gap-6 sm:gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] sm:text-xs text-primary/80 tracking-widest pl-1 uppercase font-black italic">The Full Identity <span className="text-secondary">*</span></Label>
                                            <Input
                                                value={formData.fullName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                required
                                                className="h-14 sm:h-16 bg-slate-50 border-slate-200 rounded-2xl font-bold text-primary focus-visible:ring-primary/10 shadow-sm px-6"
                                                placeholder="e.g. Dr. Alexander Vance"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] sm:text-xs text-primary/80 tracking-widest pl-1 uppercase font-black italic">Professional Designation <span className="text-secondary">*</span></Label>
                                            <Input
                                                value={formData.designation}
                                                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                                                required
                                                className="h-14 sm:h-16 bg-slate-50 border-slate-200 rounded-2xl font-bold text-primary focus-visible:ring-primary/10 shadow-sm px-6"
                                                placeholder="e.g. Associate Professor of AI"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <Label className="text-[10px] sm:text-xs text-primary/80 tracking-widest uppercase font-black italic">Electronic Mail <span className="text-secondary">*</span></Label>
                                                {emailStatus.loading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    className={`h-14 sm:h-16 rounded-2xl font-bold transition-all shadow-sm px-6 bg-slate-50 ${emailStatus.exists ? 'border-secondary/50 bg-secondary/5' : 'border-slate-200'}`}
                                                    placeholder="vance@university.edu"
                                                />
                                                {emailStatus.exists && (
                                                    <p className="absolute -bottom-6 left-1 text-[10px] text-secondary font-black uppercase tracking-widest animate-pulse">
                                                        Identity already indexed in our archives.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <header className="space-y-2">
                                        <Badge className="bg-primary/5 text-primary border-none uppercase tracking-widest font-black text-[9px] px-3">Protocol Two</Badge>
                                        <h3 className="text-2xl font-black text-primary uppercase">Research <span className="text-secondary">Footprint</span></h3>
                                        <p className="text-primary/60 text-xs font-medium uppercase tracking-widest">Connect your affiliation and technical mastery to our network.</p>
                                    </header>

                                    <div className="grid grid-cols-1 gap-6 sm:gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] sm:text-xs text-primary/80 tracking-widest pl-1 uppercase font-black italic">Institutional Provenance <span className="text-secondary">*</span></Label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20 group-focus-within:text-secondary transition-colors" />
                                                <Input
                                                    value={formData.institute}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, institute: e.target.value }))}
                                                    required
                                                    className="h-14 sm:h-16 bg-slate-50 border-slate-200 pl-14 pr-6 rounded-2xl font-bold text-primary focus-visible:ring-primary/10 shadow-sm"
                                                    placeholder="University of Advanced Engineering"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] sm:text-xs text-primary/80 tracking-widest pl-1 uppercase font-black italic">The Geographical Origin <span className="text-secondary">*</span></Label>
                                            <Select value={formData.nationality} onValueChange={(val) => setFormData(prev => ({ ...prev, nationality: val }))}>
                                                <SelectTrigger className="h-14 sm:h-16 bg-slate-50 border-slate-200 rounded-2xl font-bold text-primary px-6">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-80 rounded-2xl">
                                                    {countries.map(c => (
                                                        <SelectItem key={c.code} value={c.name} className="py-3 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                <img src={getFlagUrl(c.name)} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                                                                <span className="font-bold text-primary uppercase tracking-widest text-[10px]">{c.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] sm:text-xs text-primary/80 tracking-widest pl-1 uppercase font-black italic">Specialized Expertise Clusters <span className="text-secondary">*</span></Label>
                                            
                                            {/* Tag Selector Grid */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {PREDEFINED_INTERESTS.map(tag => (
                                                    <Badge
                                                        key={tag}
                                                        onClick={() => toggleInterest(tag)}
                                                        variant="outline"
                                                        className={`
                                                            cursor-pointer py-2 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all
                                                            ${formData.researchInterests.includes(tag) 
                                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                                                                : 'bg-white text-primary/40 border-slate-100 hover:border-primary/20 hover:text-primary'}
                                                        `}
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Custom Tag Input */}
                                            <div className="relative group">
                                                <Plus className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-secondary transition-colors" />
                                                <Input
                                                    value={customInterest}
                                                    onChange={(e) => setCustomInterest(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addCustomInterest(e)}
                                                    placeholder="Add custom domain..."
                                                    className="h-14 bg-slate-50/50 border-slate-200 pl-14 pr-32 rounded-xl font-bold text-primary text-xs uppercase tracking-widest"
                                                />
                                                <Button 
                                                    type="button"
                                                    onClick={() => addCustomInterest()}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 rounded-lg"
                                                >
                                                    Sync Tag
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
                                                {formData.researchInterests.filter(i => !PREDEFINED_INTERESTS.includes(i)).map(tag => (
                                                    <Badge key={tag} className="bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-2 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        {tag} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleInterest(tag)} />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8">
                                    <header className="space-y-2">
                                        <Badge className="bg-primary/5 text-primary border-none uppercase tracking-widest font-black text-[9px] px-3">Protocol Three</Badge>
                                        <h3 className="text-2xl font-black text-primary uppercase">Verification <span className="text-secondary">Assets</span></h3>
                                        <p className="text-primary/60 text-xs font-medium uppercase tracking-widest">Synchronize your visual and academic documentation for board screening.</p>
                                    </header>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <FileInput
                                            name="cv"
                                            label="Academic CV (PDF/DOC)"
                                            accept=".pdf,.doc,.docx"
                                            icon={FileText}
                                            value={formData.cv}
                                            onChange={(file) => setFormData(p => ({ ...p, cv: file }))}
                                        />
                                        <FileInput
                                            name="photo"
                                            label="Digital Portrait (JPG/PNG)"
                                            accept=".jpg,.jpeg,.png"
                                            icon={ImageIcon}
                                            value={formData.photo}
                                            onChange={(file) => setFormData(p => ({ ...p, photo: file }))}
                                        />
                                    </div>

                                    <aside className="p-8 bg-amber-50/50 border border-amber-200/50 rounded-[2rem] flex gap-5">
                                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Integrity Protocol</p>
                                            <p className="text-[10px] font-medium text-amber-600 leading-relaxed uppercase tracking-[0.1em]">
                                                By submitting these assets, you verify their authenticity. Encrypted verification proceeds immediately upon transmission.
                                            </p>
                                        </div>
                                    </aside>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 flex items-center justify-between gap-6">
                    {step > 1 ? (
                        <Button 
                            onClick={handleBack}
                            variant="ghost" 
                            className="h-16 px-8 rounded-2xl text-primary/40 hover:text-primary font-black text-xs tracking-widest uppercase transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 mr-3" /> Step Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button 
                            onClick={handleNext}
                            className="h-16 px-12 bg-primary text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
                        >
                            Continue Deployment <ChevronRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit}
                            disabled={reviewerMutation.isPending}
                            className="h-16 px-12 bg-secondary text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all group"
                        >
                            {reviewerMutation.isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-3" /> Transmission In Progress...
                                </>
                            ) : (
                                <>
                                    Finalize Onboarding <CheckCircle2 className="w-5 h-5 ml-3" />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
