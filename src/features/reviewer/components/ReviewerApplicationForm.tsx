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
            <Label className="opacity-70 pl-1">
                {label} <span className="text-secondary">*</span>
            </Label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    relative group cursor-pointer overflow-hidden
                    border-2 border-dashed rounded-xl p-4
                    transition-all duration-300
                    ${value
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-primary/10 bg-primary/5 hover:border-primary/20 hover:bg-primary/10'
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
                        <p className={`truncate max-w-[200px] ${value ? 'text-emerald-700' : 'text-primary/80'}`}>
                            {value ? value.name : `Select ${label}`}
                        </p>
                        <p className={`opacity-40 ${value ? 'text-emerald-600/60' : 'text-primary/40'}`}>
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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] shadow-sm transition-all border-l-[6px] border-l-primary/10 hover:border-l-secondary group relative"
            >
                <div className="absolute top-0 right-0 p-12 text-primary/5 pointer-events-none">
                    <CheckCircle2 className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <header className="mb-6 text-center">
                        <Badge className="bg-primary/5 text-primary border-none mb-3 opacity-60 px-3 py-0.5">Submitted</Badge>
                        <h2 className="text-primary mb-2">Confirmed</h2>
                        <p className="opacity-60 max-w-sm mx-auto">
                            Your application was received.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="opacity-40 mb-1">Applicant</p>
                            <p className="text-primary truncate">{formData.fullName}</p>
                            <p className="opacity-60">{formData.email}</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="opacity-40 mb-1">Reference</p>
                            <p className="text-primary">#{Math.random().toString(36).substr(2, 9)}</p>
                            <Badge variant="outline" className="mt-1.5 opacity-60 border-primary/20">Pending review</Badge>
                        </div>
                    </div>

                    <Button onClick={() => window.location.reload()} variant="outline" className="h-12 px-8 rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all"> Return to Portal </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="p-8 bg-primary/5 border border-primary/10 rounded-3xl shadow-sm transition-all border-l-[6px] border-l-primary/10 flex flex-col min-h-[600px]">
            {/* Dossier Stepper Header */}
            <div className="bg-primary p-6 sm:p-10 text-white relative rounded-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
                
                    <h2 className="mb-6 text-white text-center">Reviewer Application</h2>
                    
                    {/* Stepper */}
                    <div className="w-full max-w-md flex items-center justify-between relative px-2">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20 -translate-y-1/2 z-0" />
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300
                                    ${step >= s ? 'bg-secondary border-secondary text-white shadow-lg' : 'bg-primary border-white/20 text-white/40'}
                                `}>
                                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                                </div>
                                <span className={`${step >= s ? 'text-white' : 'text-white/30'}`}>
                                    {s === 1 ? 'Info' : s === 2 ? 'Research' : 'Upload'}
                                </span>
                            </div>
                        ))}
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
                                        <Badge className="bg-primary/5 text-primary border-none px-2.5">Step 1</Badge>
                                        <h3 className="text-primary">Info</h3>
                                        <p className="opacity-60">Add your info.</p>
                                    </header>

                                    <div className="grid grid-cols-1 gap-6 sm:gap-8">
                                        <div className="space-y-3">
                                            <Label className="opacity-80 pl-1">Full Name <span className="text-secondary">*</span></Label>
                                            <Input
                                                value={formData.fullName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                required
                                                className="h-10 bg-primary/5 border-primary/10 rounded-lg text-primary shadow-sm px-4"
                                                placeholder="e.g. Dr. Alexander Vance"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="opacity-80 pl-1">Designation <span className="text-secondary">*</span></Label>
                                            <Input
                                                value={formData.designation}
                                                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                                                required
                                                className="h-10 bg-primary/5 border-primary/10 rounded-lg text-primary shadow-sm px-4"
                                                placeholder="e.g. Associate Professor"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <Label className="opacity-80">Email Address <span className="text-secondary">*</span></Label>
                                                {emailStatus.loading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    className={`h-10 rounded-lg shadow-sm px-4 bg-primary/5 ${emailStatus.exists ? 'border-secondary/50 bg-secondary/5' : 'border-primary/10'}`}
                                                    placeholder="vance@university.edu"
                                                />
                                                {emailStatus.exists && (
                                                    <p className="absolute -bottom-5 left-1 text-secondary opacity-60">
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
                                        <Badge className="bg-primary/5 text-primary border-none px-2.5">Step 2</Badge>
                                        <h3 className="text-primary">Research</h3>
                                        <p className="opacity-60">Add research info.</p>
                                    </header>

                                    <div className="grid grid-cols-1 gap-6 sm:gap-8">
                                        <div className="space-y-3">
                                            <Label className="opacity-80 pl-1">Institution <span className="text-secondary">*</span></Label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-secondary transition-colors" />
                                                <Input
                                                    value={formData.institute}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, institute: e.target.value }))}
                                                    required
                                                    className="h-10 bg-primary/5 border-primary/10 pl-11 pr-4 rounded-lg text-primary shadow-sm"
                                                    placeholder="University Name"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="opacity-80 pl-1">Nationality <span className="text-secondary">*</span></Label>
                                            <Select value={formData.nationality} onValueChange={(val) => setFormData(prev => ({ ...prev, nationality: val }))}>
                                                <SelectTrigger className="h-10 bg-primary/5 border-primary/10 rounded-lg text-primary shadow-sm px-4">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-80 rounded-xl">
                                                    {countries.map(c => (
                                                        <SelectItem key={c.code} value={c.name} className="py-2.5 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <Image 
                                                                    src={getFlagUrl(c.name)} 
                                                                    alt={`${c.name} flag`} 
                                                                    width={18} 
                                                                    height={12} 
                                                                    className="object-cover rounded shadow-sm shrink-0" 
                                                                />
                                                                <span className="text-primary">{c.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="opacity-80 pl-1">Research Interests <span className="text-secondary">*</span></Label>
                                            
                                            {/* Tag Selector Grid */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {PREDEFINED_INTERESTS.map(tag => (
                                                    <Badge
                                                        key={tag}
                                                        onClick={() => toggleInterest(tag)}
                                                        variant="outline"
                                                        className={`
                                                            cursor-pointer py-1.5 px-3 rounded-lg transition-all
                                                            ${formData.researchInterests.includes(tag) 
                                                                ? 'bg-primary text-white border-primary shadow-md' 
                                                                : 'bg-primary/5 text-primary/50 border-primary/10 hover:border-primary/20 hover:text-primary'}
                                                        `}
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Custom Tag Input */}
                                            <div className="relative group">
                                                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20" />
                                                <Input
                                                    value={customInterest}
                                                    onChange={(e) => setCustomInterest(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addCustomInterest(e)}
                                                    placeholder="Add other interests..."
                                                    className="h-10 bg-primary/5 border-primary/10 pl-11 pr-28 rounded-lg text-primary"
                                                />
                                                <Button 
                                                    type="button"
                                                    onClick={() => addCustomInterest()}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 bg-primary text-white px-3 rounded-md"
                                                >
                                                    Add
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-3 min-h-[30px]">
                                                {formData.researchInterests.filter(i => !PREDEFINED_INTERESTS.includes(i)).map(tag => (
                                                    <Badge key={tag} className="bg-secondary/5 text-secondary border border-secondary/10 flex items-center gap-2 py-1 px-2.5 rounded-lg opacity-60">
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
                                        <Badge className="bg-primary/5 text-primary border-none px-2.5">Step 3</Badge>
                                        <h3 className="text-primary">Upload</h3>
                                        <p className="opacity-60">Upload documents.</p>
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

                                    <aside className="p-5 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex gap-4">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <div className="space-y-0.5">
                                            <p className="opacity-60">Verification</p>
                                            <p className="opacity-40 leading-relaxed">
                                                By submitting these documents, you verify their authenticity.
                                            </p>
                                        </div>
                                    </aside>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex items-center justify-between gap-4">
                    {step > 1 ? (
                        <Button 
                            onClick={handleBack}
                            variant="ghost" 
                            className="h-12 px-6 rounded-xl text-primary/40 hover:text-primary transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button 
                            onClick={handleNext}
                            className="h-12 px-8 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all group"
                        >
                            Continue <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit}
                            disabled={reviewerMutation.isPending}
                            className="h-12 px-8 bg-secondary text-white rounded-xl shadow-lg hover:bg-secondary/90 transition-all"
                        >
                            {reviewerMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
                                </>
                            ) : (
                                <>
                                    Submit <CheckCircle2 className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
