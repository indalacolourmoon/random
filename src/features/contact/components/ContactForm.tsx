"use client";

import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from 'react';
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";
import { useContactMutation } from '@/hooks/queries/usePublicMutations';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

export default function ContactForm() {
    const contactMutation = useContactMutation();

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = useCallback(async (values: ContactFormData) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            formData.append(key, value);
        });
        contactMutation.mutate(formData);
    }, [contactMutation]);

    if (contactMutation.isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 sm:space-y-6 animate-in fade-in zoom-in duration-500 bg-white rounded-3xl border border-primary/5 shadow-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className=" font-black text-primary tracking-widerer">Message <span className="text-emerald-600">Transmitted</span></h3>
                    <p className="text-primary/60 font-medium max-w-xs mx-auto text-xs sm:text-sm leading-relaxed">Our editorial team will get back to you within 24-48 hours via email.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    contactMutation.reset();
                    form.reset();
                  }} 
                  className="rounded-xl border border-primary/20 text-primary hover:bg-primary/5 font-black uppercase text-xs tracking-widest mt-4 px-6 py-3 transition-all"
                >
                  Send Another Message
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h3 className=" font-black text-primary tracking-wider">Direct Inquiry Form</h3>
                <p className="text-primary/60 text-xs font-medium mt-1">Fill out the form below and we'll get back to you shortly.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-2 text-left">
                                    <FormLabel className="text-xs sm:text-sm text-primary/70 uppercase tracking-widest pl-1">Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="h-12 bg-white border-slate-200 rounded-xl text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="Author Name" />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-rose-500 px-1" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2 text-left">
                                    <FormLabel className="text-xs sm:text-sm text-primary/70 uppercase tracking-widest pl-1">Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} className="h-12 bg-white border-slate-200 rounded-xl text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="researcher@university.edu" />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-rose-500 px-1" />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem className="space-y-2 text-left">
                                <FormLabel className="text-xs sm:text-sm text-primary/70 uppercase tracking-widest pl-1">Subject</FormLabel>
                                <FormControl>
                                    <Input {...field} className="h-12 bg-white border-slate-200 rounded-xl text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="Status Inquiry for Paper ID: IJITEST-X" />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold text-rose-500 px-1" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem className="space-y-2 text-left">
                                <FormLabel className="text-xs sm:text-sm text-primary/70 uppercase tracking-widest pl-1">Message Content</FormLabel>
                                <FormControl>
                                    <Textarea {...field} rows={5} className="bg-white border-slate-200 rounded-xl text-primary focus-visible:ring-primary/20 shadow-sm p-4 resize-none" placeholder="Provide details of your inquiry here..." />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold text-rose-500 px-1" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={contactMutation.isPending}
                        className="w-full h-12 sm:h-14 bg-primary text-white rounded-xl font-black text-sm sm:text-xs tracking-widest sm:tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                        {contactMutation.isPending ? (
                            <div className="text-lg flex items-center justify-center gap-2">
                                Transmitting <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            </div>
                        ) : (
                            <div className="text-lg flex items-center justify-center gap-2">
                                Submit <Send className="w-4 h-4 ml-2" />
                            </div>
                        )}
                    </Button>

                    {contactMutation.isError && (
                        <p className="text-secondary text-center font-bold text-xs uppercase tracking-wider">Failed to transmit. Please try again.</p>
                    )}
                </form>
            </Form>
        </div>
    );
}
