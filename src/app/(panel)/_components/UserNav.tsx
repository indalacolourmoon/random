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
                        <p className="text-xs xl:text-sm 2xl:text-lg font-semibold text-foreground leading-none mb-1 xl:mb-1.5 2xl:mb-2 capitalize group-hover:text-primary transition-colors">{user?.name || 'Loading...'}</p>
                        <p className="text-[10px] 2xl:text-sm font-semibold text-secondary tracking-widest leading-none capitalize opacity-80">{user?.role || 'Staff'}</p>
                    </div>
                    <Avatar className="h-12 w-12 xl:h-14 xl:w-14 2xl:h-20 2xl:w-20 border-2 border-primary/10 shadow-md">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm xl:text-base 2xl:text-xl font-semibold">
                            {user?.name?.charAt(0) || 'J'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 2xl:w-96 rounded-xl 2xl:rounded-3xl p-2 2xl:p-4 shadow-2xl border-primary/5 dark:bg-slate-900 dark:border-white/5">
                <DropdownMenuLabel className="text-[10px] xl:text-xs 2xl:text-base tracking-widest text-muted-foreground font-semibold px-4 py-3 2xl:py-6 capitalize">Security operations</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5 dark:bg-white/5" />
                <Link className="cursor-pointer" href="/admin/profile">
                    <DropdownMenuItem className="rounded-xl 2xl:rounded-2xl h-10 xl:h-12 2xl:h-16 gap-4 cursor-pointer px-4 2xl:px-8 font-semibold text-xs xl:text-sm 2xl:text-lg hover:bg-primary/20 transition-colors">
                        <User className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-8 2xl:h-8 text-primary/40" />
                        <span>Profile settings</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="rounded-xl 2xl:rounded-2xl h-10 xl:h-12 2xl:h-16 gap-4 cursor-pointer px-4 2xl:px-8 font-semibold text-xs xl:text-sm 2xl:text-lg"
                    onClick={() => setShowPreferences(true)}
                >
                    <Settings className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-8 2xl:h-8 text-primary/40" />
                    <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem className="rounded-xl 2xl:rounded-2xl h-10 xl:h-12 2xl:h-16 gap-4 cursor-pointer text-destructive focus:bg-destructive focus:text-white px-4 2xl:px-8 font-semibold capitalize text-xs 2xl:text-base tracking-widest" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-8 2xl:h-8" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
