"use client"

import { Search, Inbox, CheckCircle, Archive, LayoutGrid } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InboxFiltersProps {
    status: string
    search: string
    onStatusChange: (status: string) => void
    onSearchChange: (search: string) => void
    counts: {
        all: number
        pending: number
        resolved: number
        archived: number
    }
}

export function InboxFilters({
    status,
    search,
    onStatusChange,
    onSearchChange,
    counts
}: InboxFiltersProps) {
    const tabs = [
        { id: "all", label: "All Records", icon: LayoutGrid, count: counts.all },
        { id: "pending", label: "Pending", icon: Inbox, count: counts.pending, color: "bg-amber-500" },
        { id: "resolved", label: "Resolved", icon: CheckCircle, count: counts.resolved, color: "bg-emerald-600" },
        { id: "archived", label: "Archived", icon: Archive, count: counts.archived, color: "bg-slate-500" },
    ]

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="space-y-4 px-2">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search Dossier..." 
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 h-11 bg-muted/30 border-white/5 rounded-xl font-mono text-[10px] uppercase tracking-widest focus:ring-primary/20 transition-all placeholder:opacity-30"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <p className="px-5 pb-2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30">Classification</p>
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = status === tab.id
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onStatusChange(tab.id)}
                            className={cn(
                                "flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-300 group",
                                isActive 
                                    ? "bg-primary/10 text-primary shadow-sm" 
                                    : "text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={cn(
                                    "w-4 h-4 transition-transform group-hover:scale-110",
                                    isActive ? "text-primary" : "text-muted-foreground/40"
                                )} />
                                <span className="font-serif text-sm font-bold tracking-tight">{tab.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {tab.color && (
                                    <div className={cn("w-1.5 h-1.5 rounded-full my-auto", tab.color)} />
                                )}
                                <span className={cn(
                                    "text-[10px] font-mono font-black transition-colors px-2 py-0.5 rounded-full",
                                    isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground/30"
                                )}>
                                    {tab.count}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="mt-auto px-5 py-8 border-t border-white/5 opacity-40">
                <div className="p-4 bg-muted/20 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-rose-600">
                        <Archive className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Protocol Tip</span>
                    </div>
                    <p className="text-[9px] font-medium leading-relaxed text-muted-foreground text-balance">
                        Archived communiqués are preserved indefinitely but removed from active intelligence streams.
                    </p>
                </div>
            </div>
        </div>
    )
}
