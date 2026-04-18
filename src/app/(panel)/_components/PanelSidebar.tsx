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
        <Sidebar collapsible="icon" className={cn("border-r border-border/50 backdrop-blur-xl transition-all duration-300", isMobile ? "bg-card" : "bg-card/30")}>
            {/* Custom Toggle Button in the middle-right */}
            {!isMobile && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("absolute -right-4 top-1/2 -translate-y-1/2 z-50 rounded-full border border-border bg-background shadow-lg hover:bg-accent transition-all hidden lg:flex items-center justify-center cursor-pointer", isCollapsed ? "bg-primary text-white" : "bg-primary text-white")}
                            onClick={toggleSidebar}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="size-6" />
                            ) : (
                                <ChevronLeft className="size-6" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-bold bg-primary text-white border-none">
                        {isCollapsed ? "Expand" : "Collapse"}
                    </TooltipContent>
                </Tooltip>
            )}

            <SidebarHeader className="h-16 flex flex-row items-center justify-between px-6 border-b border-border/20 overflow-hidden">
                <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0" onClick={() => setOpenMobile(false)}>
                    <div className="bg-primary size-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform shrink-0">
                        <Layers className="size-5 text-white stroke-[2]" />
                    </div>
                    {!isCollapsed && (
                        <div className="space-y-0 whitespace-nowrap opacity-100 transition-opacity duration-300">
                            <h2>IJITEST</h2>
                            <span className="text-xs opacity-70">Portal</span>
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

            <SidebarContent className="px-3 py-6">
                <SidebarMenu className="space-y-2">
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
                                        "h-12 2xl:h-16 w-full px-4 rounded-xl transition-all",
                                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                        isCollapsed && "px-0 justify-center h-16"
                                    )}
                                >
                                    <Link href={item.fullHref} className="flex items-center gap-4 w-full" onClick={() => setOpenMobile(false)}>
                                        <div className={cn(
                                            "size-9 2xl:size-12 rounded-lg flex items-center justify-center transition-all shrink-0",
                                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                                        )}>
                                            {item.icon && (
                                                <div className="[&>svg]:size-5 2xl:[&>svg]:size-7">
                                                    {item.icon}
                                                </div>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <span className="font-medium text-sm">
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

            <SidebarFooter className="p-6 border-t border-border/20 mt-auto">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-4 h-12 px-4 text-rose-600 hover:bg-rose-500/10 rounded-lg transition-all font-medium text-sm cursor-pointer",
                                isCollapsed && "justify-center px-0"
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className="size-5 shrink-0" />
                            {!isCollapsed && <span>Logout</span>}
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" className="font-bold bg-rose-600 text-white border-none">
                            Logout
                        </TooltipContent>
                    )}
                </Tooltip>
            </SidebarFooter>
        </Sidebar>
    );
}

