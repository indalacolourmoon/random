'use client'
import { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import {
    Loader2, Upload, CheckCircle2, FileText, User, Mail,
    ChevronRight, BookOpen, Tag, Plus, Trash2, Phone, Briefcase,
    School, Users, Shield, Check, Download
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import { useSubmissionMutation } from "@/hooks/queries/usePublicMutations";
import { useSettings } from "@/hooks/queries/useSettings";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const coAuthorSchema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(/^[0-9]+$/, "Numbers only"),
    designation: z.string().min(2, "Designation required"),
    institution: z.string().min(2, "Institution required"),
});

const formSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    author_name: z.string().min(2, "Author name must be at least 2 characters"),
    author_email: z.string().email("Invalid email address"),
    author_phone: z.string().regex(/^[0-9]+$/, "Numbers only"),
    author_designation: z.string().min(2, "Designation required"),
    affiliation: z.string().min(5, "Affiliation must be at least 5 characters"),
    abstract: z.string().min(100, "Abstract must be at least 100 characters"),
    keywords: z.string().min(10, "Provide at least 5 keywords"),
    co_authors: z.array(coAuthorSchema).max(5, "Maximum 5 authors allowed").optional(),
    terms_accepted: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and guidelines"
    }),
});

export default function SubmissionForm() {
    const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
    const [copyrightFile, setCopyrightFile] = useState<File | null>(null);
    const submissionMutation = useSubmissionMutation();
    const { data: settings = {} } = useSettings();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            author_name: "",
            author_email: "",
            author_phone: "",
            author_designation: "",
            affiliation: "",
            abstract: "",
            keywords: "",
            co_authors: [],
            terms_accepted: false,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "co_authors" as const,
    });

    const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        if (!manuscriptFile) {
            toast.error("Manuscript Missing", {
                description: "Primary research document is required."
            });
            return;
        }
        if (!copyrightFile) {
            toast.error("Copyright Form Missing", {
                description: "The signed copyright agreement is mandatory."
            });
            return;
        }

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (key === "co_authors") {
                formData.append(key, JSON.stringify(value));
            } else if (key === "terms_accepted") {
                formData.append(key, value ? "on" : "off");
            } else {
                formData.append(key, value as string);
            }
        });
        
        formData.append("manuscript", manuscriptFile);
        formData.append("copyright_form", copyrightFile);

        submissionMutation.mutate(formData, {
            onSuccess: () => {
                toast.success("Form submitted check you mail", {
                    className: "bg-linear-to-r from-emerald-500 to-emerald-600 border-none text-white px-6 py-4 rounded-2xl shadow-xl shadow-emerald-500/20",
                });
                form.reset();
                setManuscriptFile(null);
                setCopyrightFile(null);
            }
        });
    }, [manuscriptFile, copyrightFile, submissionMutation, form]);

    const onInvalid = useCallback(() => {
        toast.error("Please fill missing forms", {
            className: "bg-linear-to-r from-rose-500 to-rose-600 border-none text-white px-6 py-4 rounded-2xl shadow-xl shadow-rose-500/20",
        });
    }, []);

    const handleManuscriptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && !file.name.toLowerCase().endsWith('.docx')) {
            toast.error("Invalid File Type", {
                description: "Only .docx files are accepted for manuscripts as per journal policy."
            });
            e.target.value = '';
            setManuscriptFile(null);
            return;
        }
        setManuscriptFile(file);
    }, []);

    const handleCopyrightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && !file.name.toLowerCase().endsWith('.docx')) {
            toast.error("Invalid File Type", {
                description: "The signed copyright agreement must be in .docx format."
            });
            e.target.value = '';
            setCopyrightFile(null);
            return;
        }
        setCopyrightFile(file);
    }, []);

    if (submissionMutation.isSuccess) {
        return (
            <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-[#000066]/5 text-[#000066] rounded-xl flex items-center justify-center border border-[#000066]/10 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Submission Successful</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Your paper has been successfully submitted. We have sent a confirmation email to the primary author.
                    </p>
                    <p className="text-xs font-bold text-[#000066] mt-4">
                        Submission ID: {(submissionMutation.data as any)?.paperId}
                    </p>
                </div>
                <Button onClick={() => submissionMutation.reset()} variant="outline" className="h-10 px-6 rounded-lg border-border/50 text-[#000066] hover:bg-[#000066]/5 font-semibold text-xs transition-all">
                    Submit Another Paper
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8 sm:space-y-12">
                
                {/* Core Metadata Section */}
                <div className="space-y-6 sm:space-y-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-[#000066]" />
                                    <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider">Research Paper Title</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Full title of your research paper..."
                                        {...field}
                                        value={field.value ?? ""}
                                        className="h-11 bg-muted/20 border-border/50 rounded-lg font-medium text-foreground px-4 text-xs xl:text-sm"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-medium text-destructive px-1" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="author_name"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4 text-[#000066]" />
                                        <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider">Author Name</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="Full Name"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-11 bg-muted/20 border-border/50 rounded-lg font-medium text-foreground px-4 text-xs xl:text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium text-destructive px-1" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="author_email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Mail className="w-4 h-4 text-[#000066]" />
                                        <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider">Email Address</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-11 bg-muted/20 border-border/50 rounded-lg font-medium text-foreground px-4 text-xs xl:text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium text-destructive px-1" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="author_phone"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Phone className="w-4 h-4 text-[#000066]" />
                                        <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider">Phone Number</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="+1 234 567 890"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-11 bg-muted/20 border-border/50 rounded-lg font-medium text-foreground px-4 text-xs xl:text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium text-destructive px-1" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="author_designation"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Briefcase className="w-4 h-4 text-[#000066]" />
                                        <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider">Designation</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Professor"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-11 bg-muted/20 border-border/50 rounded-lg font-medium text-foreground px-4 text-xs xl:text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium text-destructive px-1" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="affiliation"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <School className="w-4 h-4 text-[#000066]" />
                                        <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider">Affiliation / Institution</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Department, University, City, Country"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-11 bg-muted/20 border-border/50 rounded-lg font-medium text-foreground px-4 text-xs xl:text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium text-destructive px-1" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="abstract"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <BookOpen className="w-4 h-4 text-[#000066]" />
                                    <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider">Abstract</FormLabel>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Summarize your research paper here..."
                                        className="bg-muted/20 border-border/50 rounded-lg font-medium text-foreground p-4 resize-none min-h-[150px] text-xs xl:text-sm leading-relaxed"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <div className="flex justify-between items-center px-1">
                                    <FormDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Requirement: 100 - 500 Words</FormDescription>
                                    <span className="text-[10px] font-bold text-[#000066] uppercase">{field.value.length} Characters</span>
                                </div>
                                <FormMessage className="text-xs font-medium text-destructive px-1" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Tag className="w-4 h-4 text-[#000066]" />
                                    <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider">Keywords</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., AI, Machine Learning, Metallurgy..."
                                        {...field}
                                        value={field.value ?? ""}
                                        className="h-11 bg-muted/20 border-border/50 rounded-lg font-medium text-foreground px-4 text-xs xl:text-sm"
                                    />
                                </FormControl>
                                <FormDescription className="text-[10px] text-muted-foreground font-bold uppercase px-1">Separate keywords with commas.</FormDescription>
                                <FormMessage className="text-xs font-medium text-destructive px-1" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Co-Authors - Visual Polish */}
                <div className="space-y-8 pt-12 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#000066]/5 text-[#000066] flex items-center justify-center border border-[#000066]/10">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Co-Authors</h3>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ name: "", email: "", phone: "", designation: "", institution: "" })}
                            disabled={fields.length >= 5}
                            className="h-10 px-4 rounded-lg border-border/50 text-[#000066] font-bold text-[10px] uppercase tracking-wider hover:bg-[#000066] hover:text-white transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Author
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <AnimatePresence>
                            {fields.map((field, index) => (
                                <motion.div
                                    key={field.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="bg-card border border-border/50 shadow-sm rounded-xl overflow-hidden transition-all p-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="absolute top-4 right-4 text-destructive hover:bg-destructive/5 rounded-lg transition-all z-20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                        <CardContent className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                                                <div className="w-10 h-10 rounded-lg bg-[#000066]/5 border border-[#000066]/10 flex items-center justify-center text-[#000066] font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-sm font-semibold text-gray-900">Author Details</h4>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Affiliated contributor</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`co_authors.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                 <Input placeholder="Full Name" {...field} value={field.value ?? ""} className="h-10 bg-muted/20 border-border/50 rounded-lg font-medium shadow-none px-4 text-xs" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`co_authors.${index}.email`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                 <Input type="email" placeholder="Email Address" {...field} value={field.value ?? ""} className="h-10 bg-muted/20 border-border/50 rounded-lg font-medium shadow-none px-4 text-xs" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`co_authors.${index}.phone`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="tel" placeholder="Phone" {...field} value={field.value ?? ""} className="h-10 bg-muted/20 border-border/50 rounded-lg font-medium shadow-none px-4 text-xs" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`co_authors.${index}.designation`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="Designation" {...field} value={field.value ?? ""} className="h-10 bg-muted/20 border-border/50 rounded-lg font-medium shadow-none px-4 text-xs" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name={`co_authors.${index}.institution`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Institution / Organization" {...field} value={field.value ?? ""} className="h-10 bg-muted/20 border-border/50 rounded-lg font-medium shadow-none px-4 text-xs" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </div>

                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {fields.length === 0 && (
                        <div className="py-12 border-2 border-dashed border-border/50 rounded-xl bg-muted/20 flex flex-col items-center justify-center text-center px-6">
                             <div className="w-12 h-12 bg-card border border-border/50 rounded-xl flex items-center justify-center text-muted-foreground/30 mb-4 shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900">Single Author Submission</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-xs mt-1">
                                No co-authors listed. Up to 5 allowed.
                            </p>
                        </div>
                    )}
                </div>

                {/* Upload Infrastructure - Dual Uploads */}
                <div className="pt-10 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Manuscript Upload */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4 ml-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#000066]/5 text-[#000066] flex items-center justify-center border border-[#000066]/10">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider m-0">Manuscript Upload</FormLabel>
                                </div>
                                {settings.template_url && (
                                    <Button asChild variant="ghost" size="sm" className="h-8 text-[#000066] font-bold text-[9px] uppercase tracking-wider hover:bg-[#000066]/5">
                                        <a href={settings.template_url} download>
                                            <Download className="w-3 h-3 mr-2" />
                                            Template
                                        </a>
                                    </Button>
                                )}
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleManuscriptChange}
                                    className="hidden"
                                    id="manuscript-upload"
                                    accept=".docx"
                                />
                                <label
                                    htmlFor="manuscript-upload"
                                    className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-xl transition-all cursor-pointer shadow-sm relative overflow-hidden ${manuscriptFile
                                        ? 'border-[#000066]/50 bg-[#000066]/5'
                                        : 'border-border/50 bg-card hover:border-[#000066]/30 hover:bg-[#000066]/5'
                                        }`}
                                >
                                    {manuscriptFile ? (
                                        <div className="text-center px-4">
                                            <div className="w-12 h-12 bg-[#000066] text-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                                                <Check className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">{manuscriptFile.name}</p>
                                            <p className="text-[10px] font-bold text-[#000066]/60 uppercase mt-1">Ready to upload</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-muted/20 border border-border/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <Upload className="w-5 h-5 text-[#000066]/40" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-900">Upload Research Paper</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">DOCX Only</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Copyright Upload */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4 ml-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#000066]/5 text-[#000066] flex items-center justify-center border border-[#000066]/10">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <FormLabel className="text-[#000066] text-[11px] font-bold uppercase tracking-wider m-0">Copyright Agreement</FormLabel>
                                </div>
                                {settings.copyright_url && (
                                    <Button asChild variant="ghost" size="sm" className="h-8 text-[#000066] font-bold text-[9px] uppercase tracking-wider hover:bg-[#000066]/5">
                                        <a href={settings.copyright_url} download>
                                            <Download className="w-3 h-3 mr-2" />
                                            Agreement Form
                                        </a>
                                    </Button>
                                )}
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleCopyrightChange}
                                    className="hidden"
                                    id="copyright-upload"
                                    accept=".docx"
                                />
                                <label
                                    htmlFor="copyright-upload"
                                    className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-xl transition-all cursor-pointer shadow-sm relative overflow-hidden ${copyrightFile
                                        ? 'border-[#000066]/50 bg-[#000066]/5'
                                        : 'border-border/50 bg-card hover:border-[#000066]/30 hover:bg-[#000066]/5'
                                        }`}
                                >
                                    {copyrightFile ? (
                                        <div className="text-center px-4">
                                            <div className="w-12 h-12 bg-[#000066] text-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                                                <Check className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">{copyrightFile.name}</p>
                                            <p className="text-[10px] font-bold text-[#000066]/60 uppercase mt-1">Ready to upload</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-muted/20 border border-border/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <Upload className="w-5 h-5 text-[#000066]/40" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-900">Upload Signed Form</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Signed Word (DOCX)</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms and Submission Control */}
                <div className="space-y-8 pt-10 border-t border-border/50">
                    <FormField
                        control={form.control}
                        name="terms_accepted"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-4 space-y-0 p-6 rounded-xl bg-muted/20 border border-border/50 shadow-sm">
                                <FormControl>
                                    <Checkbox
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        className="w-5 h-5 rounded border-2 border-border data-[state=checked]:bg-[#000066] data-[state=checked]:border-[#000066] transition-all"
                                    />
                                </FormControl>
                                <div className="space-y-1 m-0!">
                                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-foreground">
                                        <span>I verify that I have read the</span>
                                        <Link href="/guidelines" target="_blank" className="text-[#000066] font-bold hover:underline">Guidelines</Link>
                                        <span>and comply with all</span>
                                        <Link href="/guidelines#terms" target="_blank" className="text-[#000066] font-bold hover:underline">Terms of Use</Link>
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Mandatory verification for all research submissions.</p>
                                </div>
                                <FormMessage className="text-[10px] font-bold text-destructive px-2" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={submissionMutation.isPending}
                        className="w-full h-12 bg-[#000066] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:bg-[#000088] active:scale-[0.99]"
                    >
                        {submissionMutation.isPending ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing Submission...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                Complete Submission
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}


