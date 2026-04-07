"use client";

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";
import NotificationCenter from '@/features/shared/components/NotificationCenter';
import { UserNav } from './UserNav';

interface PanelHeaderProps {
    filteredItems: any[];
    pathname: string;
    user: any;
    handleLogout: () => Promise<void>;
    setShowPreferences: (show: boolean) => void;
}

export function PanelHeader({
    filteredItems,
    pathname,
    user,
    handleLogout,
    setShowPreferences
}: PanelHeaderProps) {
    const activeItem = filteredItems.find(i => pathname === i.fullHref);

    return (
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4 sm:px-6 h-16 sticky top-0 z-30 transition-all">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden h-10 w-10 cursor-pointer text-primary" />
                <div className="flex flex-col">
                    <h1>
                        {activeItem?.name || 'Overview'}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationCenter />
                <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block bg-primary/10" />
                <UserNav
                    user={user}
                    handleLogout={handleLogout}
                    setShowPreferences={setShowPreferences}
                />
            </div>
        </header>
    );
}
