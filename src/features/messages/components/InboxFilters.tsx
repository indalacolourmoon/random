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
        { id: "all", label: "all", icon: LayoutGrid, count: counts.all },
        { id: "pending", label: "pending", icon: Inbox, count: counts.pending, color: "bg-amber-500" },
        { id: "resolved", label: "resolved", icon: CheckCircle, count: counts.resolved, color: "bg-emerald-600" },
        { id: "archived", label: "archived", icon: Archive, count: counts.archived, color: "bg-slate-500" },
    ]

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-muted/10 p-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = status === tab.id
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onStatusChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group text-[11px] whitespace-nowrap",
                                isActive 
                                    ? "bg-primary text-white dark:text-slate-950 font-bold shadow-sm" 
                                    : "text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground"
                            )}
                        >
                            <Icon className={cn(
                                "w-3.5 h-3.5 transition-transform group-hover:scale-110",
                                isActive ? "text-current" : "text-muted-foreground/30"
                            )} />
                            <span className="lowercase">{tab.label}</span>
                            <span className={cn(
                                "ml-1 px-1.5 py-0.5 rounded-md text-[10px]",
                                isActive ? "bg-white/20" : "bg-muted text-muted-foreground/40"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 group-focus-within:text-primary" />
                <Input 
                    placeholder="search messages" 
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-9 bg-muted/20 border-white/5 rounded-lg text-xs placeholder:opacity-50"
                />
            </div>
        </div>
    )
}
