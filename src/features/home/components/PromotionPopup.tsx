"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { markPromotionAsSeen } from '@/actions/promotion';

export default function PromotionPopup({ settings }: { settings?: Record<string, string> }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const hasSeen = localStorage.getItem('hasSeenPromotion');
            const isPromotionActive = settings?.is_promotion_active !== 'false';

            if (!hasSeen && isPromotionActive) {
                setIsVisible(true);
            }
        }, 5000); // 5 seconds delay

        return () => clearTimeout(timer);
    }, [settings]);

    const closePopup = async () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenPromotion', 'true');
        // Effortlessly sync with DB if session exists (handled by action)
        await markPromotionAsSeen();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed  inset-0 z-100 flex items-center justify-center p-4  bg-black/70 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="border-black  border-2 relative max-w-lg w-full bg-white rounded-[3rem] overflow-hidden shadow-vip max-h-[97vh] flex flex-col"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={closePopup}
                            className="absolute top-6 right-6 p-2 text-primary/40 hover:text-secondary hover:bg-secondary/10 transition-all z-20 rounded-2xl shadow-inner border border-primary/5"
                            aria-label="Close protocol"
                        >
                            <X className="w-5 h-5 animate-pulse" />
                        </Button>

                        <div className="relative z-10 p-6 sm:p-10 text-center flex flex-col h-full overflow-y-auto custom-scrollbar">
                            <div className="shrink-0 mb-4 sm:mb-6">
                                <div className=" inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/5 rounded-3xl sm:rounded-4xl text-primary shadow-inner border border-primary/5 mx-auto">
                                    <Sparkles className=" w-7 h-7 sm:w-8 sm:h-8 " />
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 shrink-0 ">

                                <h2 className=" pb-2 font-black text-primary leading-wider sm:leading-none tracking-widerer">
                                    Publish Your Research

                                </h2>
                                <p className="text-xs sm:text-sm text-primary/60 font-medium leading-relaxed border-l-4 border-secondary/50 pl-6 text-left max-w-sm mx-auto sm:max-w-none">
                                    In our commitment to supporting the next generation of innovators, the Primary Investigator will receive a 100% APC Waiver for our inaugural 2026 volume.
                                </p>
                            </div>

                            <div className="bg-primary/5 p-4 sm:p-5 rounded-3xl sm:rounded-4xl border border-primary/5 flex items-center gap-4 text-left shadow-inner shrink-0 mb-6 sm:mb-8">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-primary/5">
                                    <Gift className="animate-shine w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                                </div>
                                <p className="text-[12px]  text-left  tracking-widest text-black/70   ">
                                    Limited engagement window. Applicable for high-fidelity technical submissions validated this session.
                                </p>
                            </div>

                            <div className="flex flex-col  gap-2 sm:gap-3 mt-auto shrink-0">
                                <Link href="/submit">
                                    <Button
                                        onClick={closePopup}
                                        className=" w-full h-12 sm:h-14 bg-linear-to-r from-primary via-purple/80 from-32% hover:from-60% to-secondary text-white rounded-xl sm:rounded-2xl font-black text-[9px] cursor-pointer sm:text-[10px] md:text-base  tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all group/btn"
                                    >
                                        <span className="flex items-center justify-center gap-2 ">
                                            Submit Paper <Send className="w-4 h-4 group-hover:translate-x-1  hover:-translate-y-1 transition-transform" />
                                        </span>
                                    </Button>
                                </Link>
                                <Button
                                    variant="link"
                                    onClick={closePopup}
                                    className="text-[12px] text-black tracking-[0.2em] transition-all h-10 hover:text-primary cursor-pointer"
                                >
                                    Ask me later
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
