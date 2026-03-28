"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Shield } from "lucide-react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PreferencesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
    const { theme, setTheme } = useTheme();

    const themes = [
        {
            id: 'light',
            label: 'Light Identity',
            icon: Sun,
            color: 'bg-orange-500',
            borderColor: 'border-orange-500/20'
        },
        {
            id: 'dark',
            label: 'Dark Identity',
            icon: Moon,
            color: 'bg-primary',
            borderColor: 'border-primary/20'
        },
        {
            id: 'system',
            label: 'System Access',
            icon: Monitor,
            color: 'bg-slate-500',
            borderColor: 'border-slate-500/20'
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-primary/5 rounded-[2.5rem] p-10 shadow-vip bg-background/95 backdrop-blur-xl">
                <DialogHeader className="space-y-4 text-center sm:text-left">
                    <DialogTitle className="text-xs font-black text-primary/40 tracking-[0.3em] flex items-center gap-4 uppercase">
                        <Shield className="w-6 h-6 text-primary/20 dark:text-green-900" /> Interface Protocols
                    </DialogTitle>
                    <DialogDescription className="text-2xl font-black text-foreground tracking-wider uppercase dark:text-green-900">
                        Personnel Personalization
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-12 space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-primary/40 tracking-[0.2em] px-1 uppercase">Visual Theme Selection</label>
                        <div className="grid grid-cols-3 gap-6">
                            {themes.map((t) => {
                                const Icon = t.icon;
                                const isActive = theme === t.id;

                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`relative group flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all duration-300 ${isActive
                                            ? `${t.borderColor} bg-primary/5 shadow-inner`
                                            : 'border-transparent hover:bg-muted bg-muted/30'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? `${t.color} text-white dark:text-black shadow-lg` : 'text-muted-foreground'
                                            }`}>
                                            <Icon className={`w-7 h-7 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {t.id}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-theme"
                                                className="absolute inset-0 rounded-3xl border-2 border-primary/20 pointer-events-none"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Monitor className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-primary uppercase tracking-wider">System Synchronization</p>
                            <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">Your interface will automatically adjust to match your operating system's visual signature.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest bg-primary text-white dark:text-slate-900 hover:scale-105 transition-all"
                    >
                        Sync Preferences
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
