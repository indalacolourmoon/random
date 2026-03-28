"use client";

import Link from 'next/link';
import { LogOut, User, Settings } from 'lucide-react';
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

interface UserNavProps {
    user: any;
    handleLogout: () => Promise<void>;
    setShowPreferences: (show: boolean) => void;
}

export function UserNav({ user, handleLogout, setShowPreferences }: UserNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-14 2xl:h-16 px-3 2xl:px-4 gap-3 2xl:gap-4 hover:bg-muted dark:hover:bg-white/5 rounded-xl 2xl:rounded-2xl outline-none transition-all group cursor-pointer">
                    <div className="text-right hidden sm:block mr-2 2xl:mr-3">
                        <p className="text-sm 2xl:text-base font-black text-foreground leading-none mb-1.5 2xl:mb-2 uppercase group-hover:text-primary transition-colors">{user?.name || 'Loading...'}</p>
                        <p className="text-xs font-black text-secondary tracking-widest leading-none uppercase opacity-80">{user?.role || 'Staff'}</p>
                    </div>
                    <Avatar className="h-12 w-12 2xl:h-14 2xl:w-14 border-2 border-primary/10 shadow-md">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary text-base font-black">
                            {user?.name?.charAt(0) || 'J'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-2xl border-primary/5 dark:bg-slate-900 dark:border-white/5">
                <DropdownMenuLabel className="text-xs tracking-[0.2em] text-muted-foreground font-black px-4 py-3 uppercase">Security Operations</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5 dark:bg-white/5" />
                <Link className="cursor-pointer" href="/admin/profile">
                    <DropdownMenuItem className="rounded-xl h-11 gap-4 cursor-pointer px-4 font-bold text-sm hover:bg-primary/5 transition-colors">
                        <User className="w-5 h-5 text-primary/40" />
                        <span>Profile Settings</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="rounded-xl h-11 gap-4 cursor-pointer px-4 font-bold text-sm"
                    onClick={() => setShowPreferences(true)}
                >
                    <Settings className="w-5 h-5 text-primary/40" />
                    <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem className="rounded-xl h-11 gap-4 cursor-pointer text-destructive focus:bg-destructive focus:text-white px-4 font-black uppercase text-xs tracking-widest" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
