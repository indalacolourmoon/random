"use client";
import { motion } from 'framer-motion';
import { BookOpen, History, ChevronRight } from 'lucide-react';
import { memo } from 'react';

const disciplines = [
    "All Engineering Disciplines",
    "Science & Applied Sciences",
    "Technology & Innovation",
    "Computer Science and Information Technology",
    "AI, Artificial Intelligence, Machine Learning, and Data Science",
    "Electronics & Communication Engineering",
    "Mechanical & Civil Engineering",
    "Internet of Things (IoT), Robotics, and Automation",
    "Renewable Energy and Sustainable Technologies",
    "Management Studies, Business Administration, and Technology Management"
];

function AimAndScope({ journalShortName }: { journalShortName?: string }) {
    const shortName = journalShortName || "IJITEST";

    return (
        <div className="space-y-12">
            {/* Aim & Scope */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
                aria-labelledby="aim-scope-heading"
            >
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary/5 rounded-[2rem] text-primary border border-primary/10 shadow-vip" aria-hidden="true">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <h2>Call for Papers</h2>
                </div>

                <div className="space-y-10">
                    <p className="text-primary/80 font-medium max-w-3xl">
                        {shortName} covers all major fields of Engineering Disciplines and Modern Technology. Our scope includes, but is not limited to:
                    </p>

                    <motion.ul
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                    >
                        {disciplines.map((item, i) => (
                            <motion.li
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, x: -20, scale: 0.95 },
                                    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
                                }}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/5 shadow-sm hover:shadow-vip-hover hover:border-secondary/20 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-2 h-2 rounded-full bg-secondary group-hover:scale-150 transition-transform group-hover:bg-primary" aria-hidden="true" />
                                    <span className="text-sm font-semibold tracking-[0.2em] text-primary/90 group-hover:text-primary transition-colors cursor-pointer group-hover:text-red-600 hover:font-bold">{item}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-primary/20 group-hover:text-secondary group-hover:translate-x-1 transition-all" aria-hidden="true" />
                            </motion.li>
                        ))}
                    </motion.ul>

                    <div className="grid grid-cols-1 gap-4">
                        <article className="p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-[2rem] shadow-vip hover:shadow-vip-hover hover:border-secondary/20 hover:border-2 cursor-pointer transition-all duration-300 group">
                            <h3 className="text-primary mb-3 flex items-center gap-2 tracking-widest uppercase">
                                <span className="w-2 h-2 bg-secondary rounded-full" aria-hidden="true" />
                                Mission Priority
                            </h3>
                            <p className="text-primary/70 font-medium">
                                "Interdisciplinary research merging engineering with managerial sciences is highly prioritized."
                            </p>
                        </article>

                        <article className="p-6 bg-gradient-to-br from-secondary/5 to-transparent border border-secondary/10 rounded-[2rem] shadow-vip hover:shadow-vip-hover hover:border-secondary/20 hover:border-2 cursor-pointer transition-all duration-300 group">
                            <p className="text-sm sm:text-base text-primary/70 font-medium leading-relaxed">
                                We particularly welcome interdisciplinary work combining engineering with management, sustainability, and data-driven innovation, especially with direct industrial or societal impact.
                            </p>
                        </article>
                    </div>
                </div>
            </motion.section>

            {/* Publication Process */}
            <section className="bg-primary p-10 rounded-[3rem] text-white overflow-hidden relative shadow-vip border border-white/5 group/proc" aria-labelledby="publication-heading">
                <div className="absolute top-0 right-0 w-80 h-80 bg-secondary opacity-20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-blob pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent opacity-20 rounded-full blur-[80px] animate-blob pointer-events-none" style={{ '--delay': '2s' } as React.CSSProperties} />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center shrink-0 border border-white/20 group-hover/proc:rotate-6 group-hover/proc:animate-bounce transition-all duration-500" aria-hidden="true">
                        <History className="w-14 h-14 text-secondary" />
                    </div>
                    <div className="space-y-6">
                        <h2 id="publication-heading" className="text-white">Publication Process</h2>
                        <p className="text-white/80 font-medium m-0">
                            Accepted papers will be published online, upon receiving the final version from the authors in the recent upcoming issue. Our streamlined workflow minimizes time-to-publication while maintaining elite peer-review standards.
                        </p>
                        <div className="flex items-center gap-3 text-secondary font-black text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs tracking-[0.2em] uppercase">
                            <span className="w-8 h-[2px] bg-secondary" aria-hidden="true" />
                            Excellence in Motion
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default memo(AimAndScope);
