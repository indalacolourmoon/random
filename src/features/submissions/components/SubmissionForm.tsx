'use client'
import { useMemo, useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import {
    Loader2, Upload, CheckCircle2, FileText, User, Mail,
    ChevronRight, BookOpen, Tag, Plus, Trash2, Phone, Briefcase,
    School, Users, Shield, Check, ExternalLink, Download
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
import { Card, CardContent } from "@/components/ui/card";
import { useSubmissionMutation } from "@/hooks/queries/usePublicMutations";
import { useSettings } from "@/hooks/queries/useSettings";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
        setManuscriptFile(e.target.files?.[0] || null);
    }, []);

    const handleCopyrightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCopyrightFile(e.target.files?.[0] || null);
    }, []);

    if (submissionMutation.isSuccess) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 border border-primary/10 rounded-xl shadow-sm overflow-hidden p-8 text-center space-y-6"
            >
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner border border-primary/20 mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2>Submission Successful</h2>
                    <p className="max-w-md mx-auto">
                        Your paper has been successfully submitted. 
                        Submission ID: <span className="text-primary opacity-80">{(submissionMutation.data as any)?.paperId}</span>
                    </p>
                </div>
                <Button onClick={() => submissionMutation.reset()} variant="outline" className="h-10 px-6 rounded-lg border-primary/10 text-primary hover:bg-primary/5 font-semibold text-xs transition-all">
                    Submit Another Paper
                </Button>
            </motion.div>
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
                            <FormItem className="space-y-3">
                                <div className="flex items-center gap-3 ml-1">
                                    <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <FormLabel className="text-primary">Paper Title</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Full title of your research paper..."
                                        {...field}
                                        value={field.value ?? ""}
                                        className="h-10 bg-primary/5 border-primary/10 rounded-lg font-medium text-primary shadow-sm px-4 text-xs"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-medium text-secondary px-4" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        <FormField
                            control={form.control}
                            name="author_name"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center gap-3 ml-1">
                                        <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                                            <User className="w-4.5 h-4.5" />
                                        </div>
                                         <FormLabel className="text-primary">Author Name</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="Placeholder Text"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-10 bg-primary/5 border-primary/10 rounded-lg font-medium text-primary shadow-sm px-4 text-xs"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium text-secondary px-1" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="author_email"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center gap-3 ml-1">
                                        <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                                            <Mail className="w-4.5 h-4.5" />
                                        </div>
                                        <FormLabel className="text-primary">Email Address</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-10 bg-primary/5 border-primary/10 rounded-lg font-medium text-primary shadow-sm px-4 text-xs"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium text-secondary px-1" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="author_phone"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center gap-3 ml-1">
                                        <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                                            <Phone className="w-4.5 h-4.5" />
                                        </div>
                                        <FormLabel className="text-primary">Phone Number</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="Phone Number"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-10 bg-primary/5 border-primary/10 rounded-lg font-semibold text-primary shadow-sm px-4 text-xs"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-semibold text-secondary px-4" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        <FormField
                            control={form.control}
                            name="author_designation"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center gap-3 ml-1">
                                        <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                                            <Briefcase className="w-4.5 h-4.5" />
                                        </div>
                                        <FormLabel className="text-primary">Designation</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Professor"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-10 bg-primary/5 border-primary/10 rounded-lg font-medium text-primary shadow-sm px-4 text-xs"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium text-secondary px-1" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="affiliation"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center gap-3 ml-1">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                                            <School className="w-4.5 h-4.5" />
                                        </div>
                                        <FormLabel className="text-primary">Affiliation / College / Institute</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Department, University, City, Country"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-10 bg-primary/5 border-primary/10 rounded-lg font-semibold text-primary shadow-sm px-4 text-xs"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-semibold text-secondary px-4" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="abstract"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <div className="flex items-center gap-3 ml-1">
                                    <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                                        <BookOpen className="w-4.5 h-4.5" />
                                    </div>
                                     <FormLabel className="text-primary">Abstract</FormLabel>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Summarize your research paper here..."
                                        className="bg-primary/5 border-primary/10 rounded-lg font-medium text-primary shadow-sm p-4 resize-none min-h-[150px] text-xs leading-relaxed"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <div className="flex justify-between items-center px-4">
                                    <FormDescription className="text-xs font-medium text-muted-foreground">Word Count: 100 - 500 Words</FormDescription>
                                    <span className="text-xs font-medium text-primary/60">{field.value.length} chars</span>
                                </div>
                                <FormMessage className="text-xs font-medium text-secondary px-4" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <div className="flex items-center gap-3 ml-1">
                                    <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                                        <Tag className="w-4.5 h-4.5" />
                                    </div>
                                     <FormLabel className="text-primary">Keywords</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., AI, Machine Learning, Metallurgy..."
                                        {...field}
                                        value={field.value ?? ""}
                                        className="h-10 bg-primary/5 border-primary/10 rounded-lg font-semibold text-primary shadow-sm px-4 text-xs"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs font-semibold text-muted-foreground px-4">Provide at least 5 keywords separated by commas.</FormDescription>
                                <FormMessage className="text-xs font-semibold text-secondary px-4" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Co-Authors - Visual Polish */}
                <div className="space-y-8 pt-12 border-t border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-primary">Co-Authors</h3>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ name: "", email: "", phone: "", designation: "", institution: "" })}
                            disabled={fields.length >= 5}
                            className="h-10 px-4 rounded-lg border-primary/10 text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-all shadow-sm"
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
                                    <Card className="group relative bg-primary/5 border border-primary/10 shadow-sm rounded-xl overflow-hidden transition-all p-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="absolute top-4 right-4 text-secondary hover:bg-secondary/10 rounded-lg transition-all z-20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                        <CardContent className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-primary">Author Details</h4>
                                                    <p className="opacity-60">Enter co-author information</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`co_authors.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                 <Input placeholder="Full Name" {...field} value={field.value ?? ""} className="h-10 bg-background border-primary/10 rounded-lg font-semibold shadow-sm px-4 placeholder:truncate text-xs" />
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
                                                                <Input type="email" placeholder="E-Mail Address" {...field} value={field.value ?? ""} className="h-10 bg-background border-primary/10 rounded-lg font-semibold shadow-sm px-4 placeholder:truncate text-xs" />
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
                                                                    <Input type="tel" placeholder="Phone no" {...field} value={field.value ?? ""} className="h-10 bg-background border-primary/10 rounded-lg font-semibold shadow-sm px-4 placeholder:truncate text-xs" />
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
                                                                    <Input placeholder="Designation" {...field} value={field.value ?? ""} className="h-10 bg-background border-primary/10 rounded-lg font-semibold shadow-sm px-4 placeholder:truncate text-xs" />
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
                                                                <Input placeholder="Institution / Organization" {...field} value={field.value ?? ""} className="h-10 bg-background border-primary/10 rounded-lg font-semibold shadow-sm px-4 placeholder:truncate text-xs" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {fields.length === 0 && (
                        <div className="py-12 border-2 border-dashed border-primary/10 rounded-xl bg-primary/5 flex flex-col items-center justify-center text-center px-6 transition-all hover:bg-primary/10">
                             <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary/40 mb-4 shadow-sm border border-primary/10">
                                <Users className="w-7 h-7" />
                            </div>
                            <h4>Single Author Submission</h4>
                            <p className="opacity-60 max-w-xs">
                                You are submitting as a single author. You may add up to 5 additional authors above.
                            </p>
                        </div>
                    )}
                </div>

                {/* Upload Infrastructure - Dual Uploads */}
                <div className="pt-10 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Manuscript Upload */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4 ml-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center shadow-sm border border-primary/10">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel className="text-primary"></FormLabel>
                                        <p className="opacity-40">Upload your research paper file</p>
                                    </div>
                                </div>
                                {settings.template_url && (
                                    <Button asChild variant="ghost" size="sm" className="text-primary font-semibold text-[9px] hover:bg-primary/5">
                                        <a href={settings.template_url} download>
                                            <Download className="w-3.5 h-3.5 mr-2" />
                                            Get Template
                                        </a>
                                    </Button>
                                )}
                            </div>
                            
                            <div className="relative group/upload">
                                <input
                                    type="file"
                                    onChange={handleManuscriptChange}
                                    className="hidden"
                                    id="manuscript-upload"
                                    accept=".doc,.docx,.pdf"
                                />
                                <label
                                    htmlFor="manuscript-upload"
                                    className={`flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden ${manuscriptFile
                                        ? 'border-primary/40 bg-primary/5'
                                        : 'border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                                        }`}
                                >
                                    {manuscriptFile ? (
                                        <div className="text-center px-8 relative z-10">
                                            <div className="w-16 h-16 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <Check className="w-8 h-8" />
                                            </div>
                                            <p className="opacity-80 truncate max-w-[280px] mb-1">{manuscriptFile.name}</p>
                                            <p className="opacity-60 mb-2">Manuscript Selected</p>
                                        </div>
                                    ) : (
                                        <div className="text-center relative z-10 transition-all">
                                            <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <Upload className="w-6 h-6 text-primary" />
                                            </div>
                                            <p className="opacity-80 mb-1">Upload Manuscript</p>
                                            <p className="opacity-60">Word or PDF</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Copyright Upload */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4 ml-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center shadow-sm border border-primary/10">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel className="text-primary"></FormLabel>
                                        <p className="opacity-40">Signed copyright agreement</p>
                                    </div>
                                </div>
                                {settings.copyright_url && (
                                    <Button asChild variant="ghost" size="sm" className="text-primary font-semibold text-[9px] hover:bg-primary/5">
                                        <a href={settings.copyright_url} download>
                                            <Download className="w-3.5 h-3.5 mr-2" />
                                            Download form
                                        </a>
                                    </Button>
                                )}
                            </div>
                            
                            <div className="relative group/upload">
                                <input
                                    type="file"
                                    onChange={handleCopyrightChange}
                                    className="hidden"
                                    id="copyright-upload"
                                    accept=".doc,.docx,.pdf"
                                />
                                <label
                                    htmlFor="copyright-upload"
                                    className={`flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden ${copyrightFile
                                        ? 'border-primary/40 bg-primary/5'
                                        : 'border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                                        }`}
                                >
                                    {copyrightFile ? (
                                        <div className="text-center px-8 relative z-10">
                                            <div className="w-16 h-16 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <Shield className="w-8 h-8" />
                                            </div>
                                            <p className="opacity-80 truncate max-w-[280px] mb-1">{copyrightFile.name}</p>
                                            <p className="opacity-60 mb-2">Copyright Form Selected</p>
                                        </div>
                                    ) : (
                                        <div className="text-center relative z-10 transition-all">
                                            <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <Upload className="w-6 h-6 text-primary" />
                                            </div>
                                            <p className="opacity-80 mb-1">Upload Copyright Form</p>
                                            <p className="opacity-60">Signed Word or PDF</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms and Submission Control */}
                <div className="space-y-8 pt-10 border-t border-slate-100">
                    <FormField
                        control={form.control}
                        name="terms_accepted"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-4 space-y-0 p-6 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm group/terms transition-all hover:bg-primary/10">
                                <FormControl>
                                    <Checkbox
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        className="w-6 h-6 rounded-lg border-2 border-indigo-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 transition-all group-hover/terms:scale-110"
                                    />
                                </FormControl>
                                <div className="space-y-1.5 m-0!">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="opacity-80">I hereby verify that I have read the</span>
                                        <Link href="/guidelines" target="_blank" className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4 group/link flex items-center gap-1 transition-all">
                                            Author Guidelines
                                            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                        <span className="opacity-80">and the</span>
                                        <Link href="/guidelines#terms" target="_blank" className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4 group/link flex items-center gap-1 transition-all">
                                            Terms of Use.
                                            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                    <p className="opacity-40">I confirm that I am submitting original work and following all guidelines.</p>
                                </div>
                                <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={submissionMutation.isPending}
                        className="w-full h-14 bg-primary text-white font-semibold text-sm rounded-xl shadow-lg transition-all duration-300 hover:bg-primary/90 active:scale-[0.99] group/submit"
                    >
                        {submissionMutation.isPending ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                Submit Paper
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}


