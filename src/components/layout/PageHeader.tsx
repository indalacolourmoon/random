'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs: { name: string; href: string }[];
    scrollOnComplete?: boolean;
}

export default function PageHeader({ title, description, breadcrumbs, scrollOnComplete = true }: PageHeaderProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const animationRef = useRef<any>(null);

    useEffect(() => {
        const stopAnimation = () => {
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
        };

        window.addEventListener('wheel', stopAnimation, { passive: true });
        window.addEventListener('touchmove', stopAnimation, { passive: true });
        window.addEventListener('pointerdown', stopAnimation, { passive: true });

        return () => {
            window.removeEventListener('wheel', stopAnimation);
            window.removeEventListener('touchmove', stopAnimation);
            window.removeEventListener('pointerdown', stopAnimation);
            stopAnimation();
        };
    }, []);

    const handleAnimationComplete = () => {
        if (scrollOnComplete && sectionRef.current) {
            const sectionBottom =
                sectionRef.current.getBoundingClientRect().bottom + window.scrollY - 80;

            animationRef.current = animate(window.scrollY, sectionBottom, {
                duration: 1.2,
                ease: [0.32, 0.72, 0, 1],
                onUpdate: (latest) => window.scrollTo(0, latest),
            });
        }
    };


    return (
        <section ref={sectionRef} className="relative py-10 sm:py-14 bg-gradient-to-br from-primary via-primary/95 to-accent border-b border-white/5 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:32px_32px]" />
            <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />

            <div className="container-responsive relative z-10">
                    <ol className="flex items-center gap-2 list-none p-0">
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <motion.li 
                                    key={idx} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                                    className="flex items-center gap-2"
                                >
                                    <Link
                                        href={crumb.href}
                                        aria-current={isLast ? "page" : undefined}
                                        className={`text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-bold tracking-[0.2em] transition-all duration-300 ${isLast ? "text-white" : "text-white/50 hover:text-white"}`}
                                    >
                                        {crumb.name}
                                    </Link>
                                    {!isLast && (
                                        <ChevronRight className="w-3 h-3 text-secondary" />
                                    )}
                                </motion.li>
                            );
                        })}
                    </ol>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        onAnimationComplete={handleAnimationComplete}
                    >
                        <h1 className=" font-bold text-white mb-6 leading-none  tracking-widest">
                            {title}
                        </h1>
                        {description && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.6, duration: 1 }}
                                className="max-w-xl 2xl:max-w-4xl text-xs sm:text-sm lg:text-base 2xl:text-xl text-white/80 font-medium border-l-[3px] border-secondary/50 pl-6 leading-relaxed"
                            >
                                {description}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* VIP Decorative Card or Metric (Optional, adds to the "eye catching" feel) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="hidden lg:flex justify-end"
                    >

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
