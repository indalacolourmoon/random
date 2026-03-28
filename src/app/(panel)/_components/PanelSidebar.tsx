"use client";

import Link from 'next/link';
import { ChevronRight, Layers, LogOut, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface PanelSidebarProps {
    pathname: string;
    user: any;
    filteredItems: any[];
    handleLogout: () => Promise<void>;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export function PanelSidebar({
    pathname,
    user,
    filteredItems,
    handleLogout,
    isMobileMenuOpen,
    setIsMobileMenuOpen
}: PanelSidebarProps) {
    return (
        <>
            <div
                className={`fixed inset-0 bg-background/80 dark:bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            <aside className={`w-64 2xl:w-80 bg-background dark:bg-slate-900 border-r border-border dark:border-white/5 flex flex-col fixed lg:sticky top-0 h-screen z-50 transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 2xl:h-24 flex items-center justify-between px-8 2xl:px-10 border-b border-border">
                    <Link href="/admin" className="flex items-center gap-3 group cursor-pointer">
                        <div className="bg-primary w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">
                            <Layers className="size-8 2xl:size-9 text-white stroke-[2.5] dark:text-dark dark:stroke-[2.5]" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="font-black text-foreground leading-none tracking-wider uppercase">IJITEST</h2>
                            <span className="text-xs font-black text-muted-foreground tracking-widest uppercase opacity-60">Admin Panel</span>
                        </div>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden  text-muted-foreground">
                        <X className="size-8" />
                    </Button>
                </div>

                <nav className="flex-1 p-3 2xl:p-4 space-y-0.5 2xl:space-y-1 overflow-y-auto mt-2">
                    {filteredItems.map((item: any) => {
                        const isActive = pathname === item.fullHref;
                        return (
                            <Link
                                key={item.name}
                                href={item.fullHref}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl group transition-all ${isActive
                                    ? 'bg-primary/10 text-primary shadow-inner shadow-primary/5'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <div className="flex items-center gap-4 2xl:gap-5">
                                    <div className={`w-11 h-11 2xl:w-13 2xl:h-13 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground'
                                        }`}>
                                        {item.icon && <div className={cn("[&>svg]:w-6 [&>svg]:text-white [&>svg]:h-6 2xl:[&>svg]:w-7 2xl:[&>svg]:h-7",isActive   ? "dark:[&>svg]:text-black" : "")}>{item.icon}</div>}
                                    </div>
                                    <span className="font-black text-sm 2xl:text-base tracking-wide uppercase">
                                        {item.labelOverrides?.[user?.role || ''] || item.name}
                                    </span>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-all ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    <Button
                        variant="destructive"
                        className="w-full justify-start gap-4 h-14 2xl:h-16 px-5 2xl:px-6 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white rounded-xl 2xl:rounded-2xl transition-all border-none font-black uppercase text-xs 2xl:text-sm tracking-widest dark:text-white cursor-pointer"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-6 h-6 2xl:w-7 2xl:h-7" />
                        <span>Sign Out System</span>
                    </Button>
                </div>
            </aside>
        </>
    );
}
