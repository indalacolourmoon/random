"use client"

import { Mail, User, Clock, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"

interface Message {
    id: number
    name: string
    email: string
    subject: string
    message: string
    status: 'pending' | 'resolved' | 'archived'
    createdAt: string
    resolvedAt?: string
    resolvedByName?: string
}

interface MessageDetailProps {
    message: Message | null
}

export function MessageDetail({
    message
}: MessageDetailProps) {
    if (!message) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 opacity-40">
                <div className="w-12 h-12 rounded-xl bg-muted/20 border border-white/5 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary/20" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-bold tracking-tight">select message</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px]">
                        choose a message to read its contents.
                    </p>
                </div>
            </div>
        )
    }

    const isPending = message.status === 'pending'
    const isResolved = message.status === 'resolved'
    const isArchived = message.status === 'archived'

    return (
        <div className="h-full flex flex-col relative group">
            <header className="p-4 border-b border-white/3 bg-muted/5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted border border-white/5 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-base font-bold tracking-tight leading-none lowercase">{message.name}</h2>
                            <div className="flex flex-col gap-0.5 pt-1">
                                <a href={`mailto:${message.email}`} className="text-[11px] text-muted-foreground/60 hover:text-primary flex items-center gap-1.5 transition-colors">
                                    <Mail className="w-3 h-3 opacity-40" />
                                    {message.email}
                                </a>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                                    <Clock className="w-3 h-3 opacity-40" />
                                    {dayjs(message.createdAt).format("MMM D, YYYY [at] HH:mm")}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                            "px-2 py-0.5 text-[10px] lowercase border-none shadow-none",
                            isPending ? "bg-amber-500/10 text-amber-600" :
                            isResolved ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                        )}>
                            {message.status}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground lowercase line-clamp-2">
                        {message.subject || "no subject"}
                    </h3>
                </div>
            </header>

            <ScrollArea className="flex-1">
                <div className="p-6 max-w-3xl mx-auto w-full space-y-6 pb-24">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 lowercase tracking-tight pl-2 border-l-2 border-primary/20">
                            message
                        </div>
                        <div className="p-4 bg-muted/5 border border-white/5 rounded-xl">
                            <p className="text-sm font-medium text-foreground/90 leading-relaxed whitespace-pre-wrap lowercase">
                                {message.message}
                            </p>
                        </div>
                    </div>

                    {(isResolved || isArchived) && (
                        <div className="p-4 border border-emerald-500/10 bg-emerald-500/5 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-[10px] text-emerald-600 leading-none lowercase">
                                <CheckCircle className="w-3.5 h-3.5" /> 
                                verification details
                            </div>
                            <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                                <div className="space-y-0.5 text-muted-foreground/60 lowercase">
                                    <p className="opacity-40">status</p>
                                    <p className="font-bold text-foreground">{message.status}</p>
                                </div>
                                {message.resolvedByName && (
                                    <div className="space-y-0.5 text-muted-foreground/60 lowercase">
                                        <p className="opacity-40">admin</p>
                                        <p className="font-bold text-foreground">{message.resolvedByName}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="absolute bottom-4 left-4 right-4 p-2 bg-background/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl flex items-center justify-end">
                {/* external reply link removed as per user preference/permissions */}
            </div>
        </div>
    )
}
