"use client";

import { Mail } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface PublisherSectionProps {
    settings: Record<string, string>;
}

function PublisherSection({ settings }: PublisherSectionProps) {
    const publisherName = settings.publisher_name || "Felix Academic Publications";
    const supportEmail = settings.support_email || "editor@ijitest.org";

    return (
        <section className="section-padding bg-background relative overflow-hidden border-t border-primary/5">
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2"
            />

            <div className="container-responsive text-center sm:text-left relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-3xl"
                >
                    <h2>About the Publisher</h2>
                    <p className="text-primary/80 font-medium border-l-4 border-secondary/30 pl-8 mb-12">
                        {settings.journal_short_name || 'IJITEST'} is mentored by <span className="text-primary font-black">{publisherName}</span>, aiming to provide a high-quality bedrock for research sharing and academic excellence.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="p-1 rounded-4xl bg-linear-to-br from-primary/10 to-transparent border border-primary/5 shadow-vip group">
                            <div className="bg-white p-5 rounded-[1.8rem] flex items-center gap-5 transition-transform group-hover:scale-[1.02] duration-500">
                                <div className="w-14 h-14 bg-linear-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-secondary/20 group-hover:-rotate-12 transition-transform duration-500">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <div className="text-left">
                                    <p className="mb-1 text-primary/30 m-0">Support Desk</p>
                                    <p className="font-black text-primary tracking-wide m-0">{supportEmail}</p>
                                </div>
                            </div>
                        </div>
                        <Link href="/guidelines" className="group flex items-center gap-3 text-primary font-black text-sm tracking-[0.2em] transition-all">
                            <span className="h-[2px] w-8 bg-secondary transition-all group-hover:w-16 group-hover:bg-primary" />
                            View Formatting Guidelines
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default memo(PublisherSection);
