"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

import { ContactMessageRow } from "@/actions/messages"

interface MessageListProps {
    messages: ContactMessageRow[]
    selectedId?: number
    onSelect: (message: ContactMessageRow) => void
    selectedIds: number[]
    onToggleSelect: (id: number) => void
    loading?: boolean
}

export function MessageList({
    messages,
    selectedId,
    onSelect,
    selectedIds,
    onToggleSelect,
    loading
}: MessageListProps) {
    if (loading) {
        return (
            <div className="flex flex-col gap-1 p-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-2 w-full" />
                    </div>
                ))}
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                <div className="w-16 h-16 rounded-full bg-muted border border-dashed mb-6" />
                <h3 className="font-serif text-lg font-bold mb-2 uppercase tracking-tight">No intelligence found</h3>
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-[200px]">
                    Zero records matched your current query parameters.
                </p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col divide-y divide-white/3">
                {messages.map((message) => {
                    const isSelected = selectedId === message.id
                    const isChecked = selectedIds.includes(message.id)
                    const isPending = message.status === 'pending'
                    
                    return (
                        <div
                            key={message.id}
                            className={cn(
                                "group relative flex items-start gap-4 p-5 transition-all duration-300 cursor-pointer border-l-2",
                                isSelected 
                                    ? "bg-primary/5 border-primary shadow-[inset_0_0_20px_rgba(var(--primary),0.02)]" 
                                    : isPending 
                                        ? "border-amber-500/50 hover:bg-muted/30" 
                                        : "border-transparent hover:bg-muted/20"
                            )}
                            onClick={() => onSelect(message)}
                        >
                            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                <Checkbox 
                                    checked={isChecked}
                                    onCheckedChange={() => onToggleSelect(message.id)}
                                    className="border-white/10 data-[state=checked]:bg-primary transition-transform group-hover:scale-110"
                                />
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className={cn(
                                        "font-serif text-base tracking-tight truncate transition-colors",
                                        isPending ? "font-black text-foreground" : "font-bold text-muted-foreground"
                                    )}>
                                        {message.name}
                                    </h3>
                                    <span className="text-[9px] font-mono font-black text-muted-foreground/40 uppercase tracking-tighter shrink-0">
                                        {formatDistanceToNow(message.createdAt ? new Date(message.createdAt) : new Date(), { addSuffix: true })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <p className={cn(
                                        "text-[10px] uppercase tracking-widest truncate font-black",
                                        isPending ? "text-primary/70" : "text-muted-foreground/30"
                                    )}>
                                        {message.subject || "No Subject"}
                                    </p>
                                    <div className={cn(
                                        "w-1 h-1 rounded-full",
                                        message.status === 'pending' ? 'bg-amber-500' : 
                                        message.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-500'
                                    )} />
                                </div>

                                <p className="text-[11px] 2xl:text-sm font-medium text-muted-foreground/60 line-clamp-1 leading-relaxed transition-colors group-hover:text-foreground/80">
                                    {message.message}
                                </p>
                            </div>
                            
                            {isPending && !isSelected && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/40" />
                            )}
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}
