"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const slides = [
    { id: 1, image: "/slides/slide1.jpeg" },
    { id: 2, image: "/slides/slide2.jpg" },
    { id: 3, image: "/slides/slide3.jpg" }
];

const MAIN_TITLE = "International Journal of Innovative Trends in Engineering Science and Technology";

export default function HomeCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[300px] sm:h-[350px] lg:h-[400px] xl:h-[480px] 2xl:h-[600px] bg-slate-950 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* Background Image with Ken Burns Effect */}
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.12 }}
                        transition={{ duration: 8, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={slides[currentIndex].image}
                            alt="Journal Hero"
                            fill
                            priority
                            className="object-cover object-center opacity-40"
                            quality={100}
                        />
                    </motion.div>

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Content Container */}
                    <div className="container-responsive h-full relative z-10 flex items-center">
                        <div className="max-w-5xl space-y-6 md:space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <h1 className="leading-[1.1] mb-6 drop-shadow-2xl text-white">
                                    {MAIN_TITLE}
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="flex flex-wrap items-center gap-6"
                            >
                                <motion.div
                                    animate={{
                                        boxShadow: ["0px 0px 0px rgba(220,103,38,0)", "0px 10px 30px rgba(220,103,38,0.5)", "0px 0px 0px rgba(220,103,38,0)"]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="rounded-xl overflow-hidden"
                                >
                                    <Link
                                        href="/submit"
                                        className="btn-secondary"
                                    >
                                        Submit Manuscript
                                    </Link>
                                </motion.div>
                                <Link
                                    href="/archives"
                                    className="btn-outline border-white/20 text-white hover:bg-white/10"
                                >
                                    Explore Archives
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "h-1 rounded-full transition-all duration-1000",
                            idx === currentIndex ? "w-12 bg-secondary" : "w-6 bg-white/20"
                        )}
                    />
                ))}
            </div>
        </section>
    );
}

// Helper imported locally if not available
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
