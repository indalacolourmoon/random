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
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in zoom-in duration-500 bg-white rounded-2xl border border-primary/5 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner border border-emerald-100">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-primary lowercase">message <span className="text-emerald-600">transmitted</span></h3>
                    <p className="text-primary/60 font-medium max-w-xs mx-auto text-[10px] leading-relaxed lowercase">our editorial team will get back to you within 24-48 hours via email.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    contactMutation.reset();
                    form.reset();
                  }} 
                  className="rounded-lg border border-primary/10 text-primary hover:bg-primary/5 font-bold lowercase text-[10px] mt-2 px-4 py-2 transition-all"
                >
                  send another message
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-primary lowercase">direct inquiry form</h3>
                <p className="text-primary/60 text-[10px] font-medium mt-0.5 lowercase">fill out the form below and we'll get back to you shortly.</p>
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
                        className="w-full h-11 bg-primary text-white rounded-lg font-bold text-xs shadow-sm hover:bg-primary/95 transition-all lowercase"
                    >
                        {contactMutation.isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                transmitting <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                submit message <Send className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </Button>

                    {contactMutation.isError && (
                        <p className="text-rose-500 text-center font-bold text-[10px] lowercase">failed to transmit. please try again.</p>
                    )}
                </form>
            </Form>
        </div>
    );
}
