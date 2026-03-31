"use client"

import { Mail, Calendar, User, Clock, CheckCircle, Archive, Trash2, RotateCcw, ExternalLink, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
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
    onUpdateStatus: (id: number, status: 'resolved' | 'archived') => void
    onRevert: (id: number) => void
    onDelete: (id: number) => void
}

export function MessageDetail({
    message,
    onUpdateStatus,
    onRevert,
    onDelete
}: MessageDetailProps) {
    if (!message) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 opacity-40">
                <div className="w-24 h-24 rounded-3xl bg-muted/20 border border-white/5 flex items-center justify-center shadow-inner">
                    <Mail className="w-10 h-10 text-primary/20" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold uppercase tracking-tight">Select Intelligence</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed max-w-[240px]">
                        Choose a communique from the registry to initialize decrypted readout.
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
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10 transition-all group-hover:bg-primary/20" />
            
            <header className="p-8 sm:p-10 border-b border-white/[0.03] bg-muted/5 space-y-8">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-muted border border-white/5 flex items-center justify-center shadow-md shrink-0">
                            <User className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-2xl 2xl:text-4xl font-black tracking-tight leading-none uppercase">{message.name}</h2>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60 transition-colors">
                                <a href={`mailto:${message.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                    <Mail className="w-4 h-4 text-primary/40" />
                                    {message.email}
                                </a>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary/40" />
                                    {format(new Date(message.createdAt), "MMM d, yyyy 'at' HH:mm")}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto pt-2 sm:pt-0">
                        <Badge className={cn(
                            "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                            isPending ? "bg-amber-500/10 text-amber-600" :
                            isResolved ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                        )}>
                            {message.status}
                        </Badge>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(message.id)}
                            className="h-10 w-10 border-rose-500/10 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all rounded-xl"
                            title="Sever Communication"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                        <Badge variant="outline" className="h-5 px-2 border-primary/20 text-primary/40">COMM-ID: {message.id.toString().padStart(6, '0')}</Badge>
                        <span className="w-full h-px bg-white/5" />
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold tracking-tight leading-tight uppercase selection:bg-primary/20 text-foreground transition-colors group-hover:text-primary/90">
                        {message.subject || "No Subject Entry"}
                    </h3>
                </div>
            </header>

            <ScrollArea className="flex-1">
                <div className="p-10 sm:p-14 max-w-4xl mx-auto w-full space-y-12 pb-32">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] pl-6 before:content-[''] before:w-2 before:h-2 before:bg-primary/20 before:rounded-full">
                            Decrypted Payload
                        </div>
                        <div className="p-10 2xl:p-14 bg-muted/10 border border-white/5 rounded-[2rem] 2xl:rounded-[3rem] shadow-inner selection:bg-primary/15">
                            <p className="text-sm 2xl:text-xl font-medium text-foreground/90 leading-loose whitespace-pre-wrap font-sans opacity-95">
                                {message.message}
                            </p>
                        </div>
                    </div>

                    {(isResolved || isArchived) && (
                        <div className="p-8 border border-emerald-500/10 bg-emerald-500/[0.02] rounded-3xl space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 px-2 leading-none">
                                <CheckCircle className="w-4 h-4" /> 
                                {isArchived ? "Archival Fingerprint" : "Resolution Verification"}
                                <span className="flex-1 h-px bg-emerald-500/10 ml-4" />
                            </div>
                            <div className="flex flex-wrap items-center gap-8 px-2 font-mono text-[10px] 2xl:text-xs">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground/40 uppercase tracking-tighter">Status Hash</p>
                                    <p className="font-bold text-foreground uppercase">{message.status} / COMM-LOG-SECURE</p>
                                </div>
                                {message.resolvedByName && (
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground/40 uppercase tracking-tighter">Admin Proxy</p>
                                        <p className="font-bold text-foreground uppercase tracking-widest">{message.resolvedByName}</p>
                                    </div>
                                )}
                                {message.resolvedAt && (
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground/40 uppercase tracking-tighter">Timestamp</p>
                                        <p className="font-bold text-foreground">
                                            {format(new Date(message.resolvedAt), "yy.MM.dd | HH:mm:ss")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <footer className="absolute bottom-6 left-6 right-6 p-5 border border-white/5 bg-background/80 backdrop-blur-xl rounded-2xl 2xl:rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-6 transition-all group-hover:border-primary/20">
                <div className="flex items-center gap-3">
                    {!isResolved && !isArchived && (
                        <Button 
                            onClick={() => onUpdateStatus(message.id, 'resolved')}
                            className="h-12 px-8 2xl:h-14 2xl:px-12 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 rounded-xl font-black text-[10px] 2xl:text-sm uppercase tracking-widest gap-3 transition-all hover:scale-105 active:scale-95"
                        >
                            <CheckCircle className="w-4 h-4" /> Mark Resolved
                        </Button>
                    )}
                    {(isResolved || isArchived) && (
                        <Button 
                            variant="ghost"
                            onClick={() => onRevert(message.id)}
                            className="h-12 px-6 2xl:h-14 2xl:px-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-xl font-black text-[10px] 2xl:text-sm uppercase tracking-widest gap-3 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" /> Revert Status
                        </Button>
                    )}
                    {!isArchived && (
                        <Button 
                            variant="outline"
                            onClick={() => onUpdateStatus(message.id, 'archived')}
                            className="h-12 px-6 2xl:h-14 2xl:px-8 border-white/10 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-xl font-black text-[10px] 2xl:text-sm uppercase tracking-widest gap-3 transition-all"
                        >
                            <Archive className="w-4 h-4" /> Move to Archive
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        asChild
                        className="h-12 px-8 2xl:h-14 2xl:px-12 bg-primary text-white dark:text-black hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl font-black text-[10px] 2xl:text-sm uppercase tracking-widest gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <a href={`mailto:${message.email}?subject=RE: ${message.subject}`}>
                            <Send className="w-4 h-4" /> Dispatch Journal Rebuttal
                        </a>
                    </Button>
                </div>
            </footer>
        </div>
    )
}
