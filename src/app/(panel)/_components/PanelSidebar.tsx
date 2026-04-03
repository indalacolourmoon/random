"use client";

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Layers, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PanelSidebarProps {
    pathname: string;
    user: any;
    filteredItems: any[];
    handleLogout: () => Promise<void>;
}

export function PanelSidebar({
    pathname,
    user,
    filteredItems,
    handleLogout,
}: PanelSidebarProps) {
    const { state, open, setOpen, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <Sidebar collapsible="icon" className="border-r border-border dark:border-white/5 transition-all duration-300">
            {/* Custom Toggle Button in the middle-right */}
            {!isMobile && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("absolute -right-4 top-1/2 -translate-y-1/2 z-50  rounded-full border border-border bg-background shadow-md hover:bg-accent transition-all hidden lg:flex items-center justify-center cursor-pointer", isCollapsed ? "bg-secondary" : "bg-primary")}
                            onClick={toggleSidebar}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="size-8" />
                            ) : (
                                <ChevronLeft className="size-8" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-bold tracking-widest bg-primary text-white border-none">
                        {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    </TooltipContent>
                </Tooltip>
            )}

            <SidebarHeader className="h-20 2xl:h-24 flex flex-row items-center justify-between px-4 2xl:px-6 border-b border-border overflow-hidden">
                <Link href="/admin" className="flex items-center gap-3 2xl:gap-4 group cursor-pointer shrink-0">
                    <div className="bg-primary size-10 2xl:size-14 rounded-xl 2xl:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform shrink-0">
                        <Layers className="size-6 2xl:size-10 text-white stroke-[2.5]" />
                    </div>
                    {!isCollapsed && (
                        <div className="space-y-0.5 2xl:space-y-1 whitespace-nowrap opacity-100 transition-opacity duration-300">
                            <h2 className="font-bold text-foreground leading-none tracking-widest capitalize text-sm xl:text-base 2xl:text-lg">IJITEST</h2>
                            <span className="text-[10px] 2xl:text-sm font-bold text-muted-foreground tracking-widest capitalize opacity-80">Admin Panel</span>
                        </div>
                    )}
                </Link>

                {/* Mobile Close Button */}
                {isMobile && (
                    <Button
                        variant="ghost" 
                        size="icon"
                        className="size-10 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => setOpenMobile(false)}
                    >
                        <X className="size-6" />
                    </Button>
                )}
            </SidebarHeader>

            <SidebarContent className="px-2 2xl:px-3 py-4 2xl:py-6">
                <SidebarMenu className="space-y-1.5 2xl:space-y-4">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.fullHref;
                        return (
                            <SidebarMenuItem key={item.name}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    size="lg"
                                    tooltip={item.name}
                                    className={cn(
                                        "h-12 2xl:h-16 w-full px-3 2xl:px-6 rounded-xl 2xl:rounded-2xl transition-all",
                                        isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-foreground hover:bg-muted",
                                        isCollapsed && "px-0 justify-center h-16 2xl:h-18"
                                    )}
                                >
                                    <Link href={item.fullHref} className="flex items-center gap-4 2xl:gap-4 w-full justify-center lg:justify-start">
                                        <div className={cn(
                                            "size-10 2xl:size-14 rounded-xl 2xl:rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-sm",
                                            isCollapsed && "2xl:size-12",
                                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-muted text-foreground group-hover:bg-background"
                                        )}>
                                            {item.icon && (
                                                <div className={cn(
                                                    "[&>svg]:size-5 2xl:[&>svg]:size-8",
                                                    isActive ? "[&>svg]:text-white" : "text-primary"
                                                )}>
                                                    {item.icon}
                                                </div>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <span className={cn(
                                                "font-bold text-xs xl:text-sm 2xl:text-base tracking-widest capitalize whitespace-nowrap transition-colors",
                                                isActive ? "text-primary" : "text-foreground"
                                            )}>
                                                {item.labelOverrides?.[user?.role || ''] || item.name}
                                            </span>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 2xl:p-6 border-t border-border mt-auto">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-4 h-12 xl:h-14 2xl:h-16 px-3 2xl:px-6 text-destructive hover:bg-destructive/10 hover:text-white hover:bg-destructive rounded-xl 2xl:rounded-2xl transition-all font-bold capitalize text-xs 2xl:text-base tracking-widest overflow-hidden cursor-pointer",
                                isCollapsed && "justify-center px-0"
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className="size-6 2xl:size-9 shrink-0" />
                            {!isCollapsed && <span>Sign Out</span>}
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" className="font-bold tracking-widest bg-destructive text-white border-none">
                            Sign Out
                        </TooltipContent>
                    )}
                </Tooltip>
            </SidebarFooter>
        </Sidebar>
    );
}

