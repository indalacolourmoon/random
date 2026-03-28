"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LogOut,
    ChevronRight,
    Menu,
    X,
    User,
    Settings,
    Bell,

    Layers,
    LayoutDashboard
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { sidebarItems, getFullHref } from '@/lib/navigation';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import NotificationCenter from '@/features/shared/components/NotificationCenter';
import QueryProvider from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { useUIStore } from '@/store/useUIStore';
import PreferencesDialog from '@/features/shared/components/PreferencesDialog';
import { PanelSidebar } from './_components/PanelSidebar';
import { PanelHeader } from './_components/PanelHeader';

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { isMobileMenuOpen, setIsMobileMenuOpen, toggleMobileMenu } = useUIStore();
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't show sidebar for login page
    if (pathname === '/login') return <>{children}</>;

    // Prevent hydration mismatch by returning null until mounted
    if (!mounted) {
        return null;
    }

    const user: any = session?.user || null;
    const role = user?.role || 'reviewer';

    const filteredItems = sidebarItems.filter(item =>
        item.roles.includes(role)
    ).map(item => ({
        ...item,
        fullHref: getFullHref(item, role)
    }));

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <QueryProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
            >
                <TooltipProvider>
                    <div className="min-h-screen bg-muted/30 dark:bg-slate-950/50 flex transition-colors duration-500">
                        <PanelSidebar
                            pathname={pathname}
                            user={user}
                            filteredItems={filteredItems}
                            handleLogout={handleLogout}
                            isMobileMenuOpen={isMobileMenuOpen}
                            setIsMobileMenuOpen={setIsMobileMenuOpen}
                        />

                        <main className="flex-1 flex flex-col min-w-0">
                            <PanelHeader
                                toggleMobileMenu={toggleMobileMenu}
                                filteredItems={filteredItems}
                                pathname={pathname}
                                user={user}
                                handleLogout={handleLogout}
                                setShowPreferences={setIsPreferencesOpen}
                            />

                            <section className="p-4 lg:p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1600px] mx-auto w-full transition-all duration-500">
                                {children}
                            </section>
                        </main>

                        <PreferencesDialog
                            open={isPreferencesOpen}
                            onOpenChange={setIsPreferencesOpen}
                        />
                    </div>
                </TooltipProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}
