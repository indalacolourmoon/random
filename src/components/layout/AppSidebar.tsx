"use client";

import * as React from "react";
import {
    SendHorizonal
} from "lucide-react";
import { navigation } from "./Navbar/nav-data";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


export function AppSidebar({ settings }: { settings?: Record<string, string> }) {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();
    const journalShortName = settings?.journal_short_name || "IJITEST";

    return (
        <Sidebar collapsible="icon" className="border-r border-primary/5 bg-white/50 backdrop-blur-xl 2xl:w-[320px]">
            <SidebarHeader className="h-20 flex items-center justify-center border-b border-primary/5">
                <Link href="/" className="flex items-center gap-3 group px-4 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        {journalShortName[0]}
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-black text-xs 2xl:text-base tracking-widest text-primary ">
                            {journalShortName}
                        </span>
                        <span className="text-[10px] 2xl:text-xs font-bold text-primary/40  tracking-wider">
                            Journal Portal
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-[10px] 2xl:text-sm font-black tracking-[0.2em] text-primary/30 mt-4">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || item.children?.some(c => pathname === c.href);
                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.name}
                                            className={cn(
                                                "h-12 px-4 rounded-xl transition-all duration-300",
                                                isActive ? "bg-primary/5 text-primary font-black" : "text-primary/60 hover:bg-primary/[0.03] hover:text-primary"
                                            )}
                                        >
                                            <Link className="cursor-pointer" href={item.href} onClick={() => setOpenMobile(false)}>
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full mr-2 transition-all",
                                                    isActive ? "bg-secondary scale-125" : "bg-primary/20"
                                                )} />
                                                <span className=" text-[11px] 2xl:text-base tracking-widest">{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>

                                        {item.children && (
                                            <SidebarMenuSub className="ml-6 border-l-2 border-primary/5 py-2 space-y-1">
                                                {item.children.map((sub) => {
                                                    const isSubActive = pathname === sub.href;
                                                    return (
                                                        <SidebarMenuSubItem key={sub.name}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={isSubActive}
                                                                className={cn(
                                                                    "h-10 px-4 rounded-lg text-[10px] 2xl:text-sm font-black  tracking-widest transition-all",
                                                                    isSubActive ? "text-secondary" : "text-primary/40 hover:text-primary hover:bg-primary/5"
                                                                )}
                                                            >
                                                                <Link className="cursor-pointer" href={sub.href} onClick={() => setOpenMobile(false)}>
                                                                    {sub.name}
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        )}
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-primary/5">
                <Link
                    href="/submit"
                    className="flex items-center justify-center gap-3 w-full h-12 bg-primary text-white rounded-xl font-black  tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <SendHorizonal className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 group-data-[collapsible=icon]:hidden">Submit Paper</span>
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}
