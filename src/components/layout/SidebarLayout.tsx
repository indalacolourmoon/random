import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    className?: string;
    sidebarClassName?: string;
    mainClassName?: string;
    reverse?: boolean;
    cols?: 3 | 4;
}

export function SidebarLayout({
    children,
    sidebar,
    className,
    sidebarClassName,
    mainClassName,
    reverse = false,
    cols = 3
}: SidebarLayoutProps) {
    const gridCols = cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
    const mainSpan = cols === 3 ? "lg:col-span-2" : "lg:col-span-3";
    const sideSpan = cols === 3 ? "lg:col-span-1" : "lg:col-span-1"; // Both are 1 span in their respective grids

    return (
        <div className={cn("grid grid-cols-1 gap-12 lg:gap-20 2xl:gap-32", gridCols, className)}>
            <div className={cn(
                mainSpan,
                "space-y-16 sm:space-y-24",
                reverse && "lg:order-2",
                mainClassName
            )}>
                {children}
            </div>
            <aside className={cn(
                sideSpan,
                "space-y-10 sm:space-y-12",
                reverse && "lg:order-1",
                sidebarClassName
            )}>
                {sidebar}
            </aside>
        </div>
    );
}
