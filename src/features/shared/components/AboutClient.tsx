'use client'

import { BookOpen, Target, Building2, ShieldCheck, ListChecks, FileText, FlaskConical, Cpu, Globe, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AboutClientProps {
    settings: Record<string, string>;
}

export default function AboutClient({ settings }: AboutClientProps) {
    const journalName = settings.journal_name || "International Journal of Innovative Trends in Engineering Science and Technology";
    const journalShortName = settings.journal_short_name || "IJITEST";
    const publisherName = settings.publisher_name || "Felix Academic Publications";

    return (
        <div className="lg:col-span-2 space-y-12 sm:space-y-16">
            {/* Journal Overview */}
            <section className="relative group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-secondary/5 rounded-2xl text-secondary border border-secondary/10 shadow-vip group-hover:scale-110 transition-transform duration-500">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h2 className="text-primary m-0 font-black uppercase tracking-widest">Journal Overview</h2>
                </div>
                <div className="text-justify text-primary/80 space-y-6 2xl:space-y-10 font-medium border-l-[3px] border-primary/10 pl-8 2xl:pl-12">
                    <p>
                        {journalName} ({journalShortName}) is an international, peer-reviewed journal that publishes original research articles, review papers, and survey articles in Engineering, Science, Technology, and Management. The journal encourages interdisciplinary, theoretical, and applied research that advances innovation, industrial development, and managerial practices across emerging and established domains.
                    </p>
                    <p>
                        {journalShortName} is a peer-reviewed scholarly journal dedicated to the dissemination of high-quality research. The journal covers fundamental and applied research, interdisciplinary studies, and emerging technologies that contribute to academic knowledge, industrial growth, and sustainable development. {journalShortName} follows a rigorous peer-review process and adheres to ethical publishing standards.
                    </p>
                </div>
            </section>

            {/* Aims Section */}
            <section className="space-y-8 ">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary border border-primary/10 shadow-vip">
                        <Target className="w-6 h-6" />
                    </div>
                    <h2 className="text-primary m-0 font-black uppercase tracking-widest">Aim of the Journal</h2>
                </div>
                <div className="p-8 2xl:p-14 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-[2.5rem] shadow-vip-hover">
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-primary/80 font-medium mb-8 2xl:mb-12 leading-relaxed border-l-4 border-secondary/40 pl-6 2xl:pl-10">
                        {journalShortName} aims to provide a high-quality international platform for researchers, academicians, industry professionals, and scholars to publish original research, review articles, and technical communications in emerging areas of science, engineering, and technology.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 list-none p-0">
                        {[
                            "Promoting innovative research and technological advancements",
                            "Encouraging interdisciplinary research and collaboration",
                            "Bridging the gap between academia and industry",
                            "Publishing high-quality, peer-reviewed research articles",
                            "Supporting young researchers and scholars globally",
                            "Ensuring technical soundness and research relevance"
                        ].map((commitment, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 2xl:w-3 2xl:h-3 bg-secondary rounded-full shrink-0" />
                                <span className="text-primary/70">{commitment}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Scope Section */}
            <section className="space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-secondary/5 rounded-2xl text-secondary border border-secondary/10 shadow-vip">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-primary m-0 font-black uppercase tracking-widest">Scope of the Journal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            icon: <Cpu className="w-5 h-5 text-secondary" />,
                            title: "Engineering & Technology",
                            items: ["Electronics & Communication", "Computer Science & IT", "AI & Machine Learning", "Data Science & Big Data", "IoT & Embedded Systems", "Quantum Computing", "5G/6G Communication", "Renewable Energy Systems", "Robotics & Automation"]
                        },
                        {
                            icon: <FlaskConical className="w-5 h-5 text-secondary" />,
                            title: "Applied Sciences",
                            items: ["Physics & Applied Physics", "Mathematics & Modeling", "Chemistry & Materials", "Environmental Science"]
                        },
                        {
                            icon: <Globe className="w-5 h-5 text-secondary" />,
                            title: "Information & Communication Technologies",
                            items: ["Cloud Computing", "Cyber Security", "Blockchain Technology", "Signal & Image Processing", "Wireless Sensor Networks"]
                        },
                        {
                            icon: <Sparkles className="w-5 h-5 text-secondary" />,
                            title: "Healthcare & Life Sciences",
                            items: ["Biomedical Engineering", "Medical Electronics", "Health Informatics", "Telemedicine", "Biotechnology", "Pharmaceutical Sciences", "Public Health Management"]
                        },
                        {
                            icon: <Sparkles className="w-5 h-5 text-secondary" />,
                            title: "Management & Commerce",
                            items: ["Business Administration", "Financial Management", "Marketing Management", "Human Resource Management", "Operations & Supply Chain Management", "Business Analytics", "E-Commerce", "Digital Marketing"]
                        }
                    ].map((category, idx) => (
                        <motion.article
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="py-8 px-8 group/item bg-white rounded-[2rem] border border-primary/5 shadow-sm hover:border-secondary/20 transition-all duration-500"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-2.5 bg-secondary/5 rounded-xl border border-secondary/10 group-hover:scale-110 transition-transform">
                                    {category.icon}
                                </div>
                                <h3 className="text-primary m-0 font-bold uppercase tracking-wider">{category.title}</h3>
                            </div>
                            <ul className="space-y-2 list-none p-0">
                                {category.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
                                        <span className="text-primary/60 group-hover/item:text-primary transition-colors">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.article>
                    ))}
                </div>
            </section>

            {/* Technical Specifications */}
            <section className="bg-white p-10 sm:p-14 rounded-[3rem] border border-primary/5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-primary mb-12 flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-secondary" /> Technical Details
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {[
                        { label: "Commencement", value: "2026" },
                        { label: "Frequency", value: "12 Issues / Year" },
                        { label: "E-ISSN", value: settings.issn_number || "Applied For" },
                        { label: "Format", value: "Online, Open Access" }
                    ].map((item, i) => (
                        <div key={i} className="p-6 2xl:p-10 rounded-[2rem] bg-background border border-primary/5 group/spec hover:border-secondary/20 transition-all duration-500">
                            <dt className="text-primary/30 font-black tracking-widest uppercase text-xs mb-2">{item.label}</dt>
                            <dd className="text-primary font-bold text-lg 2xl:text-2xl">{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* Publisher Info */}
            <section className="bg-primary p-12 sm:p-16 rounded-[4rem] text-white relative overflow-hidden shadow-2xl group/publisher">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[120px] group-hover/publisher:bg-white/10 transition-colors duration-1000 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-20 h-20 2xl:w-32 2xl:h-32 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/20">
                            <Building2 className="w-10 h-10 2xl:w-16 2xl:h-16 text-secondary" />
                        </div>
                        <h2 className="text-white m-0">Legacy Publisher</h2>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-white mb-2">{publisherName}</h2>
                            <p className="text-white/40 mb-0 m-0">Foundation for Innovation & Global Excellence</p>
                        </div>
                        <div className="text-white/70 font-medium space-y-8 max-w-2xl border-l-[6px] border-secondary/20 pl-10">
                            <p>
                                {publisherName} is a mission-driven organization dedicated to bridging the gap between theoretical research and industrial application on a global scale.
                            </p>
                            <p>
                                Support for {journalShortName} ensures a stable, high-impact platform for researchers, backed by professional editorial handling and world-class indexing infrastructure.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
