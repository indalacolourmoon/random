import React, { useEffect, useState, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { navigation } from './nav-data';
import { X, ChevronRight, SendHorizontal } from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

function MobileMenuComponent({ isOpen, setIsOpen }: MobileMenuProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);

    // Body Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--removed-body-scrollbar-width)'; // Prevent layout shift if any
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* High-End Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed  inset-0 bg-primary/20 backdrop-blur-md z-[9998] lg:hidden"
                    />

                    {/* Fixed Floating Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-12 left-4 right-4 mx-auto w-[calc(100%-2rem)] max-w-[480px] bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.3)] border border-white/40 flex flex-col overflow-hidden max-h-[85vh] z-[9999] lg:hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 h-16 border-b border-primary/5 shrink-0">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-secondary  tracking-[0.3em]">Menu</span>
                                <span className="text-xs font-black text-primary  tracking-widest">Navigation</span>
                            </div>
                            <button
                                title="Close Menu"
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Navigation Scroll Area (Scrollbar Hidden) */}
                        <div className="flex-1 overflow-y-auto px-5 py-6 scrolling-touch">
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                .scrolling-touch {
                                    scrollbar-width: none;
                                    -ms-overflow-style: none;
                                }
                                .scrolling-touch::-webkit-scrollbar { 
                                    display: none; 
                                }
                            `}} />
                            <ul className="grid grid-cols-1 gap-1.5 list-none p-0">
                                {navigation.map((item, idx) => {
                                    const isActive = pathname === item.href || item.children?.some(c => pathname === c.href);
                                    return (
                                        <motion.li
                                            key={item.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 + idx * 0.03 }}
                                            className="block w-full"
                                        >
                                            <div className="space-y-1">
                                                <Link
                                                    href={item.href}
                                                    onClick={handleClose}
                                                    className={cn(
                                                        "group flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-300 border border-transparent",
                                                        isActive
                                                            ? "bg-primary/[0.04] border-primary/5"
                                                            : "hover:bg-primary/[0.02]"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={cn(
                                                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500",
                                                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/5 text-primary/40 group-hover:bg-primary/10 group-hover:text-primary"
                                                        )}>
                                                            {item.icon && <item.icon className="w-4 h-4" />}
                                                        </div>
                                                        <span className={cn(
                                                            "text-[12px] font-black tracking-[0.05em] transition-all duration-300",
                                                            isActive ? "text-primary" : "text-primary/60 group-hover:text-primary"
                                                        )}>{item.name}</span>
                                                    </div>
                                                    <ChevronRight className={cn(
                                                        "w-3.5 h-3.5 transition-all duration-500",
                                                        isActive ? "text-secondary translate-x-0" : "text-primary/10 -translate-x-1 group-hover:translate-x-0 group-hover:text-primary/30"
                                                    )} />
                                                </Link>

                                                {item.children && (
                                                    <ul className="ml-12 space-y-1 border-l border-primary/5 pl-4 pb-1 list-none p-0">
                                                        {item.children.map((child) => {
                                                            const isSubActive = pathname === child.href;
                                                            return (
                                                                <li key={child.name}>
                                                                    <Link
                                                                        href={child.href}
                                                                        onClick={handleClose}
                                                                        className={cn(
                                                                            "flex items-center gap-2.5 py-1.5 text-[10px] font-bold tracking-wider transition-all",
                                                                            isSubActive ? "text-secondary" : "text-primary/40 hover:text-primary"
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                                                            isSubActive ? "bg-secondary scale-110 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "bg-primary/10"
                                                                        )} />
                                                                        {child.name}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Footer / CTA */}
                        <div className="px-6 py-5 border-t border-primary/5 shrink-0">
                            <Link
                                href="/submit"
                                className="btn-primary btn-fill-secondary w-full h-14 flex items-center justify-center gap-3"
                                onClick={handleClose}
                            >
                                <SendHorizontal className="w-4 h-4 relative z-20" />
                                <span className="relative z-20">Submit Manuscript</span>
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

export const MobileMenu = memo(MobileMenuComponent);
