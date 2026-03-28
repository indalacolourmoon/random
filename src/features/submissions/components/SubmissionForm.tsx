"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2, Upload, CheckCircle2, AlertCircle, FileText, User, Mail, ChevronRight, BookOpen, Tag, Plus, Minus, Trash2, Phone, Briefcase, School, Users } from "lucide-react";
import { toast } from "sonner";
import { submitPaper } from "@/actions/submit-paper";
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

const coAuthorSchema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone required"),
    designation: z.string().min(2, "Designation required"),
    institution: z.string().min(2, "Institution required"),
});

const formSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    author_name: z.string().min(2, "Author name must be at least 2 characters"),
    author_email: z.string().email("Invalid email address"),
    affiliation: z.string().min(5, "Affiliation must be at least 5 characters"),
    abstract: z.string().min(100, "Abstract must be at least 100 characters"),
    keywords: z.string().min(10, "Provide at least 4 keywords"),
co_authors: z.array(coAuthorSchema).max(5, "Maximum 5 authors allowed").optional(),});

import { useSubmissionMutation } from "@/hooks/queries/usePublicMutations";

export default function SubmissionForm() {
    const [file, setFile] = useState<File | null>(null);
    const submissionMutation = useSubmissionMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            author_name: "",
            author_email: "",
            affiliation: "",
            abstract: "",
            keywords: "",
            co_authors: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "co_authors" as const,
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!file) {
            toast.error("Missing Manuscript", {
                description: "Primary asset (document file) is required for submission."
            });
            return;
        }

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (key === "co_authors") {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value as string);
            }
        });
        formData.append("manuscript", file);

        submissionMutation.mutate(formData, {
            onSuccess: () => {
                form.reset();
                setFile(null);
            }
        });
    }

    if (submissionMutation.isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 sm:space-y-6 animate-in fade-in zoom-in duration-500 bg-white rounded-3xl border border-primary/5 shadow-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-primary m-0 font-black tracking-wider ">Submission <span className="text-emerald-600">Successful</span></h2>
                    <p className="text-primary/60 max-w-sm mx-auto font-medium m-0 text-sm leading-relaxed">
                        Your manuscript has been received. Our editorial team will begin the screening process shortly.
                    </p>
                </div>
                <Button onClick={() => submissionMutation.reset()} variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black text-xs tracking-widest mt-4 uppercase">
                    Submit Another Paper
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 sm:space-y-10">

                <div className="space-y-6 sm:space-y-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <FormLabel className="text-primary m-0">Manuscript Title</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Enter the full title of your research..."
                                        {...field}
                                        className="h-12 sm:h-14 xl:h-16 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6 placeholder:text-gray-400 text-base xl:text-lg"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold text-secondary" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <FormField
                            control={form.control}
                            name="author_name"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-3 mb-3 ml-1">
                                        <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <FormLabel className="text-primary m-0">Corresponding Author</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="Full Name"
                                            {...field}
                                            className="h-12 sm:h-14 xl:h-16 bg-white border-slate-200 rounded-xl font-bold text-primary placeholder:text-gray-400 focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6 text-base xl:text-lg"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-secondary" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="author_email"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-3 mb-3 ml-1">
                                        <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-primary" />
                                        </div>
                                        <FormLabel className="text-primary m-0">Contact Email</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="email@university.edu"
                                            {...field}
                                            className="h-12 sm:h-14 xl:h-16 bg-white border-slate-200 placeholder:text-gray-400 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6 text-base xl:text-lg"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-secondary" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="affiliation"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                    </div>
                                    <FormLabel className="text-primary m-0">Institutional Affiliation</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Department, University, City, Country"
                                        {...field}
                                        className="h-12 sm:h-14 xl:h-16 bg-white border-slate-200 placeholder:text-gray-400 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6 text-base xl:text-lg"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold text-secondary" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="abstract"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <FormLabel className="text-primary m-0">Manuscript Abstract</FormLabel>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Provide a concise summary of your research objectives, methodology, and results..."
                                        className="bg-white border-slate-200 rounded-xl font-bold placeholder:text-gray-400 text-primary focus-visible:ring-primary/20 shadow-sm p-4 sm:p-6 resize-none min-h-[180px] xl:min-h-[220px] text-base xl:text-lg"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-[10px] sm:text-[12px] font-black  tracking-wider text-primary/50 mt-2 px-1">Min 100 characters. Summarize findings for indexing.</FormDescription>
                                <FormMessage className="text-[10px] font-bold text-secondary" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 mb-3 ml-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                        <Tag className="w-4 h-4 text-primary" />
                                    </div>
                                    <FormLabel className="text-xs font-black tracking-widest uppercase text-primary m-0">Index Keywords</FormLabel>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Keyword 1, Keyword 2, Keyword 3, Keyword 4"
                                        {...field}
                                        className="h-12 sm:h-14 xl:h-16 bg-white border-slate-200 rounded-xl placeholder:text-gray-400 font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4 sm:px-6 text-base xl:text-lg"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs font-black tracking-wider text-primary/50 mt-2 px-1">Minimum 4 keywords separated by commas.</FormDescription>
                                <FormMessage className="text-xs font-bold text-secondary" />
                            </FormItem>
                        )}
                    />

                    {/* Co-Authors Section */}
                    <div className="space-y-6 pt-6 border-t border-primary/5">
                        <div className="flex items-center justify-between gap-3 mb-3 ml-1">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 2xl:w-12 2xl:h-12 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 2xl:w-6 2xl:h-6 text-secondary" />
                                </div>
                                <FormLabel className="text-xs font-black tracking-widest uppercase text-primary m-0">Co-Authors Information</FormLabel>
                            </div>
                        </div>

                        {fields.map((field, index) => (
                            <Card key={field.id} className="relative group/author bg-slate-50/50 border-primary/5 rounded-[2rem] overflow-hidden">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="absolute top-4 right-4 text-primary/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <CardContent className="p-8 sm:p-10 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-primary/5 flex items-center justify-center text-primary font-black text-sm">
                                            {index + 1}
                                        </div>
                                        <h3 className=" font-black tracking-widest text-primary uppercase">Co-Author {index + 1}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <FormField
                                            control={form.control}
                                            name={`co_authors.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2 mb-2 ml-1">
                                                        <User className="w-3.5 h-3.5 text-primary/40" />
                                                        <FormLabel className="text-[10px] font-black tracking-widest text-primary/60">Full Name</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Input placeholder="Full Name" {...field} className="h-12 bg-white rounded-xl font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold text-secondary" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`co_authors.${index}.email`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2 mb-2 ml-1">
                                                        <Mail className="w-3.5 h-3.5 text-primary/40" />
                                                        <FormLabel className="text-[10px] font-black tracking-widest text-primary/60">Email Address</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Input type="email" placeholder="email@university.edu" {...field} className="h-12 bg-white rounded-xl font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold text-secondary" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <FormField
                                            control={form.control}
                                            name={`co_authors.${index}.phone`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2 mb-2 ml-1">
                                                        <Phone className="w-3.5 h-3.5 text-primary/40" />
                                                        <FormLabel className="text-primary/60 m-0">Phone Number</FormLabel>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex items-center justify-center h-12 px-3 bg-white border border-slate-200 rounded-xl font-black text-primary/60 shrink-0">
                                                            India +91
                                                        </div>
                                                        <FormControl>
                                                            <Input placeholder="81234 56789" {...field} className="h-12 bg-white rounded-xl font-bold" />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage className="text-[10px] font-bold text-secondary" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`co_authors.${index}.designation`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2 mb-2 ml-1">
                                                        <Briefcase className="w-3.5 h-3.5 text-primary/40" />
                                                        <FormLabel className="text-[10px] font-black tracking-widest text-primary/60">Designation</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Associate Professor" {...field} className="h-12 bg-white rounded-xl font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold text-secondary" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name={`co_authors.${index}.institution`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-2 mb-2 ml-1">
                                                    <School className="w-3.5 h-3.5 text-primary/40" />
                                                    <FormLabel className="text-[10px] font-black tracking-widest text-primary/60">Institution / University</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Input placeholder="Department, University, City" {...field} className="h-12 bg-white rounded-xl font-bold" />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold text-secondary" />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex justify-center pt-4">
                            {fields.length < 5 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ name: "", email: "", phone: "", designation: "", institution: "" })}
                                    className="btn-outline w-full sm:w-auto"
                                >
                                    <Plus className="w-5 h-5 2xl:w-8 2xl:h-8 mr-3" />
                                    Add Another Co-Author
                                </Button>
                            ) : (
                                <p className="text-[10px] font-black text-primary/40 tracking-widest uppercase bg-slate-50 px-6 py-3 rounded-xl border border-primary/5">
                                    Maximum limit of 5 co-authors reached
                                </p>
                            )}
                        </div>

                        {fields.length === 0 && (
                            <div className="mt-8 py-12 border-2 border-dashed border-primary/5 rounded-[2.5rem] bg-white/30 flex flex-col items-center justify-center text-center px-8">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h4 className=" font-black text-primary/40 tracking-widest uppercase mb-2">No Co-Authors Added</h4>
                                <p className="text-xs text-primary/30 font-medium max-w-xs leading-relaxed">
                                    You can add up to 5 additional authors for this manuscript submission.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-3 ml-1">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                <Upload className="w-4 h-4 text-primary" />
                            </div>
                            <FormLabel className="text-[12px] sm:text-[16px] font-black  tracking-[0.2em] text-primary">Manuscript </FormLabel>
                        </div>
                        <div className="relative group/upload">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="manuscript-upload"
                                accept=".doc,.docx,.pdf"
                            />
                            <label
                                htmlFor="manuscript-upload"
                                className={`flex flex-col items-center justify-center w-full h-48 2xl:h-72 border-2 border-dashed rounded-2xl sm:rounded-3xl transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden bg-white ${file
                                    ? 'border-emerald-300'
                                    : 'border-slate-300 hover:border-primary/40'
                                    }`}
                            >
                                {file ? (
                                    <div className="text-center px-8 relative z-10 animate-in fade-in zoom-in duration-500">
                                        <div className="w-14 h-14 2xl:w-20 2xl:h-20 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                                            <FileText className="w-6 h-6 2xl:w-10 2xl:h-10" />
                                        </div>
                                        <p className="text-sm xl:text-lg 2xl:text-xl font-black text-primary truncate max-w-sm mb-1">{file.name}</p>
                                        <p className="text-emerald-600/80 m-0">Asset Synchronized • Change Protocol</p>
                                    </div>
                                ) : (
                                    <div className="text-center relative z-10">
                                        <div className="w-14 h-14 2xl:w-20 2xl:h-20 bg-primary/5 border border-primary/10 rounded-xl shadow-inner flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-500">
                                            <Upload className="w-5 h-5 2xl:w-10 2xl:h-10 text-primary" />
                                        </div>
                                        <p className="text-xs font-black tracking-widest text-primary m-0 uppercase">Upload Manuscript</p>
                                        <p className="text-xs font-black text-primary/30 mt-2 m-0 uppercase">DOC, DOCX, PDF</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={submissionMutation.isPending}
                    className="w-full h-14 sm:h-16 bg-primary text-white font-black text-[10px] sm:text-xs  tracking-[0.2em] sm:tracking-[0.3em] rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] group/btn"
                >
                    {submissionMutation.isPending ? (
                        <>In-Flight Transmission <Loader2 className="w-4 h-4 2xl:w-6 2xl:h-6 ml-3 animate-spin" /></>
                    ) : (
                        <div className="flex items-center gap-2">
                            Submit <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                    )}
                </Button>
            </form>
        </Form>
    );
}

