"use client";

import { Menu, SeparatorVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NotificationCenter from '@/features/shared/components/NotificationCenter';
import { UserNav } from './UserNav';

interface PanelHeaderProps {
    toggleMobileMenu: () => void;
    filteredItems: any[];
    pathname: string;
    user: any;
    handleLogout: () => Promise<void>;
    setShowPreferences: (show: boolean) => void;
}

export function PanelHeader({
    toggleMobileMenu,
    filteredItems,
    pathname,
    user,
    handleLogout,
    setShowPreferences
}: PanelHeaderProps) {
    const activeItem = filteredItems.find(i => pathname === i.fullHref);

    return (
        <header className="bg-background/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border dark:border-white/5 flex items-center justify-between px-6 lg:px-10 xl:px-12 2xl:px-20 h-20 xl:h-24 2xl:h-32 sticky top-0 z-30 transition-all duration-500">
            <div className="flex items-center gap-6 2xl:gap-10">
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="lg:hidden h-10 w-10 cursor-pointer">
                    <Menu className="w-6 h-6" />
                </Button>
                <div className="flex flex-col">
                    <h1 className=" font-black uppercase tracking-widest heading-v5 hidden sm:block text-base xl:text-lg 2xl:text-2xl">
                        {activeItem?.name || 'Dashboard Protocol'}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4 2xl:gap-8">
                <NotificationCenter />
                <Separator orientation="vertical" className="mx-2 xl:mx-4 2xl:mx-6 h-8 xl:h-10 2xl:h-14 hidden sm:block bg-primary/10 dark:bg-white/10" />
                <UserNav
                    user={user}
                    handleLogout={handleLogout}
                    setShowPreferences={setShowPreferences}
                />
            </div>
        </header>
    );
}
