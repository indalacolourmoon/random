"use client";

import { BookOpen, ShieldCheck, UserCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

function AuthorQuickLinks() {
    const links = [
        {
            label: "Guidelines",
            href: "/guidelines",
            description: "Formatting instructions & templates",
            icon: BookOpen,
            color: "text-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            label: "Ethics",
            href: "/ethics",
            description: "Publication ethics & COPE policy",
            icon: ShieldCheck,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50"
        },
        {
            label: "Peer Review",
            href: "/peer-review",
            description: "Our double-blind review process",
            icon: UserCheck,
            color: "text-amber-500",
            bgColor: "bg-amber-50"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="bg-white p-8 2xl:p-14 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300">
                <h3 className="mb-6 text-gray-900 m-0">For Authors</h3>
                <div className="space-y-4 2xl:space-y-8">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className="flex items-center gap-4 p-4 2xl:p-8 rounded-2xl bg-gray-50/50 hover:bg-white hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-md group"
                        >
                            <div className={`p-3 2xl:p-5 rounded-xl ${link.bgColor} ${link.color} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                <link.icon className="w-5 h-5 2xl:w-8 2xl:h-8" />
                            </div>
                            <div className="flex-1">
                                <p className="m-0 group-hover:text-primary transition-colors">
                                    {link.label}
                                </p>
                                <p className="opacity-60 line-clamp-1 m-0">
                                    {link.description}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 2xl:w-6 2xl:h-6 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                        </Link>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default memo(AuthorQuickLinks);
