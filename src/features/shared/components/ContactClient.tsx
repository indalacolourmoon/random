'use client';

import { Mail, MapPin, ShieldAlert, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/features/contact/components/ContactForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";

interface ContactClientProps {
    settings: Record<string, string>;
}

export default function ContactClient({ settings }: ContactClientProps) {
    const supportEmail = settings.support_email || "editor@iitest.org";
    const supportPhone = settings.support_phone || "+91 8919643590";
    const officeAddress = settings.office_address || "Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India";
    const publisherName = settings.publisher_name || "Felix Academic Publications";

    const contactMethods = [
        {
            icon: Mail,
            title: "Editorial Support",
            value: supportEmail,
            href: `mailto:${supportEmail}`,
            subtext: "24/7 Author Assistance",
            accent: "primary"
        },
        {
            icon: MessageSquare,
            title: "WhatsApp Hotline",
            value: supportPhone,
            href: `https://wa.me/${supportPhone.replace(/[\s+]/g, '')}`,
            subtext: "Immediate Technical Support",
            accent: "secondary"
        }
    ];

    return (
        <section className="container-responsive section-padding">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Contact Section */}
                <div className="lg:col-span-2 space-y-16">
                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {contactMethods.map((method, idx) => (
                            <section key={idx} className="group relative">
                                <div className={`p-6 bg-white border border-primary/5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 flex items-center gap-5 ${method.accent === 'primary' ? 'border-l-primary/10 hover:border-l-primary' : 'border-l-secondary/10 hover:border-l-secondary'}`}>
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${method.accent === 'primary' ? 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-secondary/5 text-secondary group-hover:bg-secondary group-hover:text-white'}`}>
                                        <method.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <h3 className="text-xs font-bold text-primary/60 lowercase m-0">{method.title}</h3>
                                        <a
                                            href={method.href}
                                            className="text-primary hover:text-secondary transition-colors block break-words no-underline font-bold text-lg sm:text-xl lowercase"
                                        >
                                            {method.value}
                                        </a>
                                        <div className="flex items-center gap-1.5 text-[10px] text-primary/40 font-bold lowercase">
                                            <Clock className="w-3.5 h-3.5 opacity-40" />
                                            {method.subtext}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Contact Form Section */}
                    <section className="space-y-6">
                        <h2 className="text-primary/90 m-0 text-xl font-bold lowercase">
                            send us a message
                        </h2>
                        <div className="p-6 bg-white border border-primary/5 rounded-2xl shadow-sm border-l-4 border-l-primary/5">
                            <ContactForm />
                        </div>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <aside className="space-y-12">
                    {/* Office Address Card */}
                    <section className="space-y-3">
                        <h3 className="text-primary/60 pl-3 border-l-2 border-primary m-0 text-[10px] font-bold lowercase">editorial headquarters</h3>
                        <div className="p-6 bg-white border border-primary/5 rounded-2xl shadow-sm border-l-4 border-l-secondary/10 hover:border-l-secondary transition-all group flex items-start gap-4">
                            <div className="w-10 h-10 bg-secondary/5 rounded-lg flex items-center justify-center shrink-0 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-primary/90 m-0 lowercase">{publisherName}</h3>
                                <p className="text-xs text-primary/60 m-0 leading-relaxed lowercase">{officeAddress}</p>
                            </div>
                        </div>
                    </section>

                    {/* Integrated Widgets */}
                    <div className="space-y-8">
                        <div className="group/widget transition-transform duration-500 hover:-translate-y-1">
                            <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.3rem]">
                                <TrackManuscriptWidget />
                            </div>
                        </div>

                        <section className="bg-primary p-10 2xl:p-16 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 2xl:w-16 2xl:h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                    <ShieldAlert className="w-6 h-6 2xl:w-10 2xl:h-10 text-white" />
                                </div>
                                <h3 className="text-white m-0">Publication Ethics</h3>
                                <p className="text-white/60 m-0">IJITEST strictly adheres to COPE guidelines for scientific integrity and peer-review ethics.</p>
                                <Button asChild variant="link" className="text-white p-0 h-auto hover:text-white transition-colors m-0">
                                    <Link href="/ethics" className="flex items-center">
                                        View Policy <ChevronRight className="w-4 h-4 2xl:w-6 2xl:h-6 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </section>
                    </div>
                </aside>
            </div>
        </section>
    );
}
