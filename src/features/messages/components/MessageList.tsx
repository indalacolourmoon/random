import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"

import { ContactMessageRow } from "@/actions/messages"

interface MessageListProps {
    messages: ContactMessageRow[]
    selectedId?: number
    onSelect: (message: ContactMessageRow) => void
    loading?: boolean
}

const MessageItem = memo(({ 
    message, 
    isSelected, 
    onSelect
}: { 
    message: ContactMessageRow, 
    isSelected: boolean, 
    onSelect: (msg: ContactMessageRow) => void
}) => {
    const isPending = message.status === 'pending'
    
    return (
        <div
            className={cn(
                "group relative flex items-start gap-3 p-2.5 transition-all duration-200 cursor-pointer border-l-2",
                isSelected 
                    ? "bg-primary/5 border-primary" 
                    : isPending 
                        ? "border-amber-500/30 hover:bg-muted/30" 
                        : "border-transparent hover:bg-muted/20"
            )}
            onClick={() => onSelect(message)}
        >
            <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                    <h3 className={cn(
                        "text-sm tracking-tight truncate lowercase",
                        isPending ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                    )}>
                        {message.name}
                    </h3>
                    <span className="text-[9px] text-muted-foreground/40 lowercase shrink-0">
                        {dayjs(message.createdAt || new Date()).fromNow()}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-hidden">
                    <p className={cn(
                        "text-[10px] tracking-tight truncate font-medium lowercase",
                        isPending ? "text-primary/70" : "text-muted-foreground/30"
                    )}>
                        {message.subject || "no subject"}
                    </p>
                    <div className={cn(
                        "w-1 h-1 rounded-full shrink-0",
                        message.status === 'pending' ? 'bg-amber-500' : 
                        message.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-500'
                    )} />
                </div>

                <p className="text-[11px] text-muted-foreground/60 line-clamp-1 leading-normal lowercase">
                    {message.message}
                </p>
            </div>
            
            {isPending && !isSelected && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
        </div>
    )
})

MessageItem.displayName = "MessageItem"

export function MessageList({
    messages,
    selectedId,
    onSelect,
    loading
}: MessageListProps) {
    if (loading) {
        return (
            <div className="flex flex-col p-2">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="p-2.5 space-y-1.5">
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-2 w-12" />
                        </div>
                        <Skeleton className="h-2 w-32" />
                    </div>
                ))}
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                <h3 className="text-sm font-bold mb-1 lowercase">no messages</h3>
                <p className="text-[10px] lowercase max-w-[150px]">
                    no records found matching your selection.
                </p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col divide-y divide-white/2">
                {messages.map((message) => (
                    <MessageItem 
                        key={message.id}
                        message={message}
                        isSelected={selectedId === message.id}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </ScrollArea>
    )
}
