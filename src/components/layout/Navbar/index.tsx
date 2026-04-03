"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NavbarBrand } from './NavbarBrand';
import { NavbarLinks } from './NavbarLinks';
import { MobileMenu } from './MobileMenu';
import Link from 'next/link';

export default function Navbar({ settings }: { settings?: Record<string, string> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const shortName = settings?.journal_short_name || "IJITEST";

    useEffect(() => {
        if (isOpen) {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            id="journal-navbar"
            className={`sticky top-0 z-50 w-full transition-all duration-700 ${isScrolled
                ? 'bg-white/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.05)] py-0.5'
                : 'bg-background/95 backdrop-blur-xl border-b border-primary/5 py-0'}`}>
            <div className="container-responsive">
                <div className={`flex justify-between items-center transition-all duration-700 ${isScrolled ? 'h-14 lg:h-16 2xl:h-24' : 'h-16 lg:h-20 xl:h-24 2xl:h-32'}`}>

                    {/* Brand */}
                    <NavbarBrand shortName={shortName} isScrolled={isScrolled} />

                    {/* Desktop Navigation */}
                    <NavbarLinks isScrolled={isScrolled} />

                    {/* Actions */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        <Link
                            href="/submit"
                            className="btn-primary btn-fill-secondary"
                        >
                            <span className="relative z-20 hidden sm:inline">Submit Paper</span>
                            <span className="relative z-20 sm:hidden">Submit</span>
                        </Link>

                        {/* Mobile menu button */}
                        <div className="lg:hidden flex items-center">
                            <button
                                id="mobile-nav-toggler"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle navigation menu"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                            >
                                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
        </nav>
    );
}
