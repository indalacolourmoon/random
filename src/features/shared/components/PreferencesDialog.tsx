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
            <DialogContent className="sm:max-w-md border-border/50 rounded-xl p-8 shadow-sm bg-card">
                <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-[#000066]" /> Display Settings
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Configure your interface theme preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-8 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#000066] uppercase tracking-wider px-1">Theme Selection</label>
                        <div className="grid grid-cols-3 gap-4">
                            {themes.map((t) => {
                                const Icon = t.icon;
                                const isActive = theme === t.id;

                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`relative group flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${isActive
                                            ? `border-[#000066]/50 bg-[#000066]/5 shadow-sm`
                                            : 'border-border/50 hover:bg-muted/50 bg-muted/20'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isActive 
                                            ? `bg-[#000066] text-white shadow-sm` 
                                            : 'text-muted-foreground'
                                            }`}>
                                            <Icon className={`w-5 h-5 ${isActive ? 'scale-100' : 'group-hover:scale-105'}`} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-[#000066]' : 'text-muted-foreground'}`}>
                                            {t.id}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#000066]/5 border border-border/50 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#000066]/10 flex items-center justify-center flex-shrink-0">
                            <Monitor className="w-4 h-4 text-[#000066]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#000066] uppercase tracking-wider">System Sync</p>
                            <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase opacity-60">Automatically matches your OS theme.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="h-10 px-8 rounded-lg font-bold uppercase text-[10px] tracking-widest bg-[#000066] text-white hover:bg-[#000088] transition-all"
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
