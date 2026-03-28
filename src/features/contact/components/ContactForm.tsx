"use client";

import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { submitContactMessage } from '@/actions/messages';
import { useContactMutation } from '@/hooks/queries/usePublicMutations';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactForm() {
    const contactMutation = useContactMutation();

    async function handleSubmit(formData: FormData) {
        contactMutation.mutate(formData);
    }

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
                <Button variant="outline" onClick={() => contactMutation.reset()} className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black uppercase text-xs tracking-widest mt-4">Send Another Message</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h3 className=" font-black text-primary tracking-wider">Direct Inquiry Form</h3>
                <p className="text-primary/60 text-xs font-medium mt-1">Fill out the form below and we'll get back to you shortly.</p>
            </div>

            <form action={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 text-left">
                        <Label className="text-xs sm:text-sm text-primary/70 uppercase tracking-widest pl-1">Full Name</Label>
                        <Input name="name" required className="h-12 bg-white border-slate-200 rounded-xl text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="Author Name" />
                    </div>
                    <div className="space-y-2 text-left">
                        <Label className="text-xs sm:text-sm text-primary/70 uppercase tracking-widest pl-1">Email Address</Label>
                        <Input name="email" type="email" required className="h-12 bg-white border-slate-200 rounded-xl text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="researcher@university.edu" />
                    </div>
                </div>
                <div className="space-y-2 text-left">
                    <Label className="text-xs sm:text-sm text-primary/70 uppercase tracking-widest pl-1">Subject</Label>
                    <Input name="subject" required className="h-12 bg-white border-slate-200 rounded-xl text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="Status Inquiry for Paper ID: IJITEST-X" />
                </div>
                <div className="space-y-2 text-left">
                    <Label className="text-xs sm:text-sm text-primary/70 uppercase tracking-widest pl-1">Message Content</Label>
                    <Textarea name="message" rows={5} required className="bg-white border-slate-200 rounded-xl      text-primary focus-visible:ring-primary/20 shadow-sm p-4 resize-none" placeholder="Provide details of your inquiry here..." />
                </div>

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
        </div>
    );
}
