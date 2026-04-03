"use client";

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

    async function onSubmit(values: z.infer<typeof formSchema>) {
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
                    className: "bg-gradient-to-r from-emerald-500 to-emerald-600 border-none text-white font-black px-6 py-4 rounded-2xl shadow-xl shadow-emerald-500/20",
                });
                form.reset();
                setManuscriptFile(null);
                setCopyrightFile(null);
            }
        });
    }

    if (submissionMutation.isSuccess) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-6 bg-white rounded-2xl border border-primary/5 shadow-2xl"
            >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100 rotate-3">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Submission <span className="text-emerald-600 underline decoration-emerald-100 underline-offset-8">Successful</span></h2>
                    <p className="text-slate-500 max-w-md mx-auto font-medium text-sm leading-relaxed">
                        Your manuscript has been successfully submitted to the peer-review queue. 
                        Submission ID: <span className="text-primary font-black">{(submissionMutation.data as any)?.paperId}</span>
                    </p>
                </div>
                <Button onClick={() => submissionMutation.reset()} variant="outline" className="h-12 px-8 rounded-xl border-primary/10 text-primary hover:bg-primary/5 font-black text-xs tracking-widest transition-all active:scale-95">
                    Submit Another Paper
                </Button>
            </motion.div>
        );
    }

    const onInvalid = () => {
        toast.error("Please fill missing forms", {
            className: "bg-gradient-to-r from-rose-500 to-rose-600 border-none text-white font-black px-6 py-4 rounded-2xl shadow-xl shadow-rose-500/20",
        });
    };

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
                                    <FormLabel className="text-base 2xl:text-lg font-black text-primary tracking-tight">Paper / Manuscript Title</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Full title of your research paper..."
                                        {...field}
                                        value={field.value ?? ""}
                                        className="h-12 md:h-14 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-5 text-base md:text-lg 2xl:text-xl placeholder:text-slate-500 placeholder:truncate"
                                    />
                            </FormControl>
                                <FormMessage className="text-[10px] 2xl:text-xs font-black tracking-widest text-secondary px-4" />
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
                                         <FormLabel className="text-xs 2xl:text-sm font-black text-primary tracking-widest">Lead Author Name</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="Full Name"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-12 2xl:h-14 2xl:text-lg bg-white border-slate-200 rounded-xl font-bold text-primary placeholder:text-slate-500 placeholder:truncate focus-visible:ring-primary/20 shadow-sm px-5 text-base"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
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
                                        <FormLabel className="text-xs 2xl:text-sm font-black text-primary tracking-widest">Email Address</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="yourname@gmail.com"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-12 2xl:h-14 2xl:text-lg bg-white border-slate-200 placeholder:text-slate-500 placeholder:truncate rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-5 text-base"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
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
                                        <FormLabel className="text-xs 2xl:text-sm font-black text-primary tracking-widest">Phone Number</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="Phone Number"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-12 2xl:h-14 2xl:text-lg bg-white border-slate-200 placeholder:text-slate-500 placeholder:truncate rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-5 text-base"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
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
                                        <FormLabel className="text-xs 2xl:text-sm font-black text-primary tracking-widest">Designation</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Assistant Professor, Research Scholar"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-12 2xl:h-14 2xl:text-lg bg-white border-slate-200 placeholder:text-slate-500 placeholder:truncate rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-5 text-base"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
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
                                        <FormLabel className="text-xs 2xl:text-sm font-black text-primary tracking-widest">Affiliation / College / Institute</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Department, University, City, Country"
                                            {...field}
                                            value={field.value ?? ""}
                                            className="h-12 2xl:h-14 2xl:text-lg bg-white border-slate-200 placeholder:text-slate-500 placeholder:truncate rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-5 text-base"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
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
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                                        <BookOpen className="w-4.5 h-4.5" />
                                    </div>
                                     <FormLabel className="text-xs 2xl:text-sm font-black text-primary tracking-widest">Abstract</FormLabel>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Summarize your research paper here..."
                                        className="bg-white border-slate-200 rounded-2xl font-medium placeholder:text-slate-500 placeholder:truncate text-primary focus-visible:ring-primary/20 shadow-sm p-5 resize-none min-h-[200px] text-base 2xl:text-lg leading-relaxed"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <div className="flex justify-between items-center px-4">
                                    <FormDescription className="text-[10px] 2xl:text-xs font-black tracking-widest text-slate-500">Word Count: 100 - 500 Words</FormDescription>
                                    <span className="text-[10px] font-black text-amber-600/60 tracking-widest">{field.value.length} CHARS</span>
                                </div>
                                <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <div className="flex items-center gap-3 ml-1">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Tag className="w-4.5 h-4.5" />
                                    </div>
                                     <FormLabel className="text-xs 2xl:text-sm font-black text-primary tracking-widest">Keywords</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., AI, Machine Learning, Metallurgy..."
                                        {...field}
                                        value={field.value ?? ""}
                                        className="h-12 2xl:h-14 2xl:text-lg bg-white border-slate-200 rounded-xl placeholder:text-slate-500 placeholder:truncate font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-5 text-base"
                                    />
                                </FormControl>
                                <FormDescription className="text-[10px] 2xl:text-xs font-black tracking-widest text-slate-500 px-4">Provide at least 5 keywords separated by commas.</FormDescription>
                                <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Co-Authors - Visual Polish */}
                <div className="space-y-8 pt-12 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 text-slate-400 flex items-center justify-center shadow-inner border border-slate-100">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-primary tracking-tight">Co-Authors</h3>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ name: "", email: "", phone: "", designation: "", institution: "" })}
                            disabled={fields.length >= 5}
                            className="h-11 px-6 rounded-xl border-primary/10 text-primary font-black text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Co-Author
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
                                    <Card className="group relative bg-slate-50/50 border-white shadow-xl rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:bg-white p-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="absolute top-4 right-4 text-secondary hover:bg-secondary hover:scale-90 rounded-xl transition-all z-20"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </Button>

                                        <CardContent className="p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-primary font-black text-base">
                                                    {index + 1}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-primary tracking-widest text-sm">Author Details</h4>
                                                    <p className="text-[10px] 2xl:text-xs font-bold text-slate-400">Enter co-author information</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`co_authors.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                 <Input placeholder="Full Name" {...field} value={field.value ?? ""} className="h-11 2xl:h-14 2xl:text-base bg-white border-slate-100 rounded-xl font-bold shadow-sm px-5 placeholder:truncate" />
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
                                                                <Input type="email" placeholder="E-Mail Address" {...field} value={field.value ?? ""} className="h-11 2xl:h-14 2xl:text-base bg-white border-slate-100 rounded-xl font-bold shadow-sm px-5 placeholder:truncate" />
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
                                                                    <Input type="tel" placeholder="Phone no" {...field} value={field.value ?? ""} className="h-11 2xl:h-14 2xl:text-base bg-white border-slate-100 rounded-xl font-bold shadow-sm px-5 placeholder:truncate" />
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
                                                                    <Input placeholder="Designation" {...field} value={field.value ?? ""} className="h-11 2xl:h-14 2xl:text-base bg-white border-slate-100 rounded-xl font-bold shadow-sm px-5 placeholder:truncate" />
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
                                                                <Input placeholder="Institution / Organization" {...field} value={field.value ?? ""} className="h-11 2xl:h-14 2xl:text-base bg-white border-slate-100 rounded-xl font-bold shadow-sm px-5 placeholder:truncate" />
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
                        <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/20 flex flex-col items-center justify-center text-center px-6 transition-all hover:bg-slate-50/40">
                             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-sm border border-slate-50">
                                <Users className="w-7 h-7" />
                            </div>
                            <h4 className="text-xs font-black text-slate-500 tracking-[0.2em] mb-1">Single Author Submission</h4>
                            <p className="text-xs text-slate-400 font-medium max-w-xs leading-relaxed">
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
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel className="text-base 2xl:text-lg font-black text-primary tracking-tight"></FormLabel>
                                        <p className="text-[10px] 2xl:text-xs font-bold text-slate-400 tracking-widest">Upload your research paper file</p>
                                    </div>
                                </div>
                                {settings.template_url && (
                                    <Button asChild variant="ghost" size="sm" className="text-blue-600 font-black text-[9px] tracking-widest hover:bg-primary">
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
                                    onChange={(e) => setManuscriptFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="manuscript-upload"
                                    accept=".doc,.docx,.pdf"
                                />
                                <label
                                    htmlFor="manuscript-upload"
                                    className={`flex flex-col items-center justify-center w-full min-h-[250px] border-2 border-dashed rounded-2xl transition-all duration-700 cursor-pointer shadow-vip relative overflow-hidden bg-white ${manuscriptFile
                                        ? 'border-blue-400 bg-blue-50/10'
                                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                                        }`}
                                >
                                    {manuscriptFile ? (
                                        <div className="text-center px-8 relative z-10 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
                                            <div className="w-20 h-20 bg-blue-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-2 transition-transform hover:rotate-0">
                                                <Check className="w-10 h-10" />
                                            </div>
                                            <p className="text-xl font-black text-primary truncate max-w-[280px] mb-2">{manuscriptFile.name}</p>
                                            <p className="text-[10px] 2xl:text-xs font-black text-blue-600/60 tracking-[0.2em] mb-4">File Selected • Manuscript</p>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-4 py-2 rounded-xl text-[10px] font-black tracking-widest cursor-pointer">
                                                Change File
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="text-center relative z-10 transition-all group-hover/upload:scale-110">
                                            <div className="w-20 h-20 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl flex items-center justify-center mx-auto mb-8 transition-all duration-700 group-hover/upload:shadow-blue-500/10 group-hover/upload:-translate-y-2">
                                                <Upload className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <p className="text-sm 2xl:text-base font-black tracking-[0.2em] text-primary mb-2">Upload Manuscript</p>
                                            <p className="text-[10px] 2xl:text-xs font-black text-slate-500 tracking-widest">Word (.docx) or PDF format</p>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-500/10" />
                                </label>
                            </div>
                        </div>

                        {/* Copyright Upload */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4 ml-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel className="text-base 2xl:text-lg font-black text-primary tracking-tight"></FormLabel>
                                        <p className="text-[10px] 2xl:text-xs font-bold text-slate-400 tracking-widest">Signed copyright agreement</p>
                                    </div>
                                </div>
                                {settings.copyright_url && (
                                    <Button asChild variant="ghost" size="sm" className="text-indigo-600 font-black text-[9px] tracking-widest hover:bg-primary">
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
                                    onChange={(e) => setCopyrightFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="copyright-upload"
                                    accept=".doc,.docx,.pdf"
                                />
                                <label
                                    htmlFor="copyright-upload"
                                    className={`flex flex-col items-center justify-center w-full min-h-[250px] border-2 border-dashed rounded-2xl transition-all duration-700 cursor-pointer shadow-vip relative overflow-hidden bg-white ${copyrightFile
                                        ? 'border-indigo-400 bg-indigo-50/10'
                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                                        }`}
                                >
                                    {copyrightFile ? (
                                        <div className="text-center px-8 relative z-10 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
                                            <div className="w-20 h-20 bg-indigo-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl -rotate-2 transition-transform hover:rotate-0">
                                                <Shield className="w-10 h-10" />
                                            </div>
                                            <p className="text-xl font-black text-primary truncate max-w-[280px] mb-2">{copyrightFile.name}</p>
                                            <p className="text-[10px] 2xl:text-xs font-black text-indigo-600/60 tracking-[0.2em] mb-4">File Selected • Copyright Form</p>
                                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-4 py-2 rounded-xl text-[10px] font-black tracking-widest cursor-pointer">
                                                Change File
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="text-center relative z-10 transition-all group-hover/upload:scale-110">
                                            <div className="w-20 h-20 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl flex items-center justify-center mx-auto mb-8 transition-all duration-700 group-hover/upload:shadow-indigo-500/10 group-hover/upload:-translate-y-2">
                                                <Upload className="w-8 h-8 text-indigo-500" />
                                            </div>
                                            <p className="text-sm 2xl:text-base font-black tracking-[0.2em] text-primary mb-2">Upload Copyright Form</p>
                                            <p className="text-[10px] 2xl:text-xs font-black text-slate-500 tracking-widest">Signed Word or PDF file</p>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-500/10" />
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
                            <FormItem className="flex flex-row items-center space-x-4 space-y-0 p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100 shadow-inner group/terms transition-all hover:bg-indigo-50/50">
                                <FormControl>
                                    <Checkbox
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        className="w-6 h-6 rounded-lg border-2 border-indigo-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 transition-all group-hover/terms:scale-110"
                                    />
                                </FormControl>
                                <div className="space-y-1.5 !m-0">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="text-xs 2xl:text-sm font-black text-primary tracking-tight">I hereby verify that I have read the</span>
                                        <Link href="/guidelines" target="_blank" className="text-xs 2xl:text-sm font-black text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4 group/link flex items-center gap-1 transition-all">
                                            Author Guidelines
                                            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                        <span className="text-xs 2xl:text-sm font-black text-primary tracking-tight">and the</span>
                                        <Link href="/guidelines#terms" target="_blank" className="text-xs 2xl:text-sm font-black text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4 group/link flex items-center gap-1 transition-all">
                                            Terms of Use.
                                            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                    <p className="text-[10px] 2xl:text-xs font-bold text-slate-500 tracking-widest">I confirm that I am submitting original work and following all guidelines.</p>
                                </div>
                                <FormMessage className="text-[10px] 2xl:text-xs font-black text-secondary px-4" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={submissionMutation.isPending}
                        className="w-full h-14 md:h-16 2xl:h-20 bg-primary text-white font-black text-xs sm:text-sm 2xl:text-base tracking-[0.2em] 2xl:tracking-[0.3em] rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 transition-all duration-500 hover:scale-[1.01] hover:shadow-primary/30 active:scale-[0.99] group/submit relative overflow-hidden"
                    >
                        {submissionMutation.isPending ? (
                            <div className="flex items-center gap-4">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                SUBMITTING MANUSCRIPT...
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 relative z-10">
                                SUBMIT PAPER
                                <ChevronRight className="w-6 h-6 group-hover/submit:translate-x-2 transition-transform" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/submit:opacity-100 transition-opacity" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}


