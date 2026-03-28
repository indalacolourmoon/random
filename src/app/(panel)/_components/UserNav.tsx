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
                <Button variant="ghost" className="h-14 xl:h-16 2xl:h-24 px-3 xl:px-4 2xl:px-8 gap-3 xl:gap-4 2xl:gap-8 hover:bg-muted dark:hover:bg-white/15 rounded-xl 2xl:rounded-[2rem] outline-none transition-all group cursor-pointer">
                    <div className="text-right hidden sm:block mr-2 xl:mr-3 2xl:mr-5">
                        <p className="text-sm xl:text-base 2xl:text-2xl font-black text-foreground leading-none mb-1.5 xl:mb-2 2xl:mb-3 uppercase group-hover:text-primary transition-colors">{user?.name || 'Loading...'}</p>
                        <p className="text-xs 2xl:text-lg font-black text-secondary tracking-widest leading-none uppercase opacity-80">{user?.role || 'Staff'}</p>
                    </div>
                    <Avatar className="h-12 w-12 xl:h-14 xl:w-14 2xl:h-20 2xl:w-20 border-2 border-primary/10 shadow-md">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary text-base 2xl:text-2xl font-black">
                            {user?.name?.charAt(0) || 'J'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 2xl:w-96 rounded-xl 2xl:rounded-3xl p-2 2xl:p-4 shadow-2xl border-primary/5 dark:bg-slate-900 dark:border-white/5">
                <DropdownMenuLabel className="text-xs 2xl:text-lg tracking-[0.2em] text-muted-foreground font-black px-4 py-3 2xl:py-6 uppercase">Security Operations</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5 dark:bg-white/5" />
                <Link className="cursor-pointer" href="/admin/profile">
                    <DropdownMenuItem className="rounded-xl 2xl:rounded-2xl h-12 2xl:h-20 gap-4 cursor-pointer px-4 2xl:px-8 font-bold text-sm 2xl:text-xl hover:bg-primary/20 transition-colors">
                        <User className="w-5 h-5 2xl:w-8 2xl:h-8 text-primary/40" />
                        <span>Profile Settings</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="rounded-xl 2xl:rounded-2xl h-12 2xl:h-20 gap-4 cursor-pointer px-4 2xl:px-8 font-bold text-sm 2xl:text-xl"
                    onClick={() => setShowPreferences(true)}
                >
                    <Settings className="w-5 h-5 2xl:w-8 2xl:h-8 text-primary/40" />
                    <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem className="rounded-xl 2xl:rounded-2xl h-12 2xl:h-20 gap-4 cursor-pointer text-destructive focus:bg-destructive focus:text-white px-4 2xl:px-8 font-black uppercase text-xs 2xl:text-lg tracking-widest" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 2xl:w-8 2xl:h-8" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
