'use client';

import { Mail, MapPin, ShieldAlert, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/features/contact/components/ContactForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contactMethods.map((method, idx) => (
                            <Card key={idx} className="p-6 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                        <method.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">{method.title}</p>
                                        <a
                                            href={method.href}
                                            className="text-sm xl:text-base font-semibold text-primary hover:underline transition-all block wrap-break-word"
                                        >
                                            {method.value}
                                        </a>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <Clock className="w-3 h-3 opacity-50" />
                                            {method.subtext}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Contact Form Section */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-primary m-0">
                            Send us a message
                        </h2>
                        <Card className="p-6 border-border/50 bg-card rounded-xl">
                            <ContactForm />
                        </Card>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <aside className="space-y-12">
                    {/* Office Address Card */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                             <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase m-0">Editorial Headquarters</p>
                        </div>
                        <Card className="p-6 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className='text-sm font-semibold text-foreground m-0'>Dr. T. Ravi babu,</h3>
                                    <h3 className="text-sm font-semibold text-foreground m-0">{publisherName},</h3>
                                    <p className="text-xs text-muted-foreground m-0 leading-relaxed">{officeAddress}</p>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Integrated Widgets */}
                    <div className="space-y-6">
                        <Card className="p-1 border-border/50 bg-muted/20 rounded-2xl">
                            <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50">
                                <TrackManuscriptWidget />
                            </div>
                        </Card>

                        <section className="bg-[#000066] p-8 rounded-2xl text-white relative overflow-hidden">
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                    <ShieldAlert className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white m-0">Publication Ethics</h3>
                                <p className="text-xs text-white/60 m-0 leading-relaxed">IJITEST strictly adheres to COPE guidelines for scientific integrity and peer-review ethics.</p>
                                <Button asChild variant="link" className="text-white p-0 h-auto hover:text-white transition-colors m-0 text-xs">
                                    <Link href="/ethics" className="flex items-center">
                                        View Policy <ChevronRight className="w-3.5 h-3.5 ml-2" />
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
