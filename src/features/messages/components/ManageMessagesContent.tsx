"use client"

import { useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { InboxFilters } from "./InboxFilters"
import { MessageList } from "./MessageList"
import { MessageDetail } from "./MessageDetail"
import { useMessages, useUpdateMessageStatus, useBulkUpdateMessages, useRevertMessage } from "@/hooks/queries/useMessages"
import { Button } from "@/components/ui/button"
import { CheckCircle, Archive, X } from "lucide-react"

export function ManageMessagesContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const activeStatus = searchParams.get('status') || 'all'
    const queryStatus = activeStatus === 'all' ? undefined : (activeStatus as 'pending' | 'resolved' | 'archived')
    const search = searchParams.get('search') || ""

    const { data: messages = [], isLoading } = useMessages({ status: queryStatus, search })
    const updateMutation = useUpdateMessageStatus()
    const bulkMutation = useBulkUpdateMessages()
    const revertMutation = useRevertMessage()

    const [selectedMessage, setSelectedMessage] = useState<any>(null)
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    const counts = {
        all: messages.length,
        pending: messages.filter(m => m.status === 'pending').length,
        resolved: messages.filter(m => m.status === 'resolved').length,
        archived: messages.filter(m => m.status === 'archived').length
    }

    const updateFilters = (newFilters: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === 'all' || !value) params.delete(key)
            else params.set(key, value)
        })
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleSelectMessage = (message: any) => {
        setSelectedMessage(message)
    }

    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleUpdateStatus = async (id: number, newStatus: 'resolved' | 'archived') => {
        const toastId = toast.loading(`Updating status to ${newStatus}...`)
        try {
            const res = await updateMutation.mutateAsync({ id, status: newStatus })
            if (res.success) {
                toast.success(`Message marked as ${newStatus}`, { id: toastId })
                if (selectedMessage?.id === id) {
                    setSelectedMessage((prev: any) => ({ ...prev, status: newStatus }))
                }
            } else {
                toast.error(res.error || "Update failed", { id: toastId })
            }
        } catch (e) {
            toast.error("Internal service error", { id: toastId })
        }
    }

    const handleBulkUpdate = async (newStatus: 'resolved' | 'archived') => {
        if (selectedIds.length === 0) return
        const toastId = toast.loading(`Bulk updating ${selectedIds.length} messages...`)
        try {
            const res = await bulkMutation.mutateAsync({ ids: selectedIds, status: newStatus })
            if (res.success) {
                toast.success(`Successfully updated ${selectedIds.length} messages`, { id: toastId })
                setSelectedIds([])
            } else {
                toast.error(res.error || "Bulk update failed", { id: toastId })
            }
        } catch (e) {
            toast.error("Internal service error", { id: toastId })
        }
    }

    const handleRevert = async (id: number) => {
        const toastId = toast.loading("Reverting status...")
        try {
            const res = await revertMutation.mutateAsync(id)
            if (res.success) {
                toast.success("Status reverted to pending", { id: toastId })
                if (selectedMessage?.id === id) {
                    setSelectedMessage((prev: any) => ({ ...prev, status: 'pending' }))
                }
            } else {
                toast.error(res.error || "Revert failed", { id: toastId })
            }
        } catch (e) {
            toast.error("Internal service error", { id: toastId })
        }
    }

    return (
        <div className="flex flex-col xl:flex-row h-full gap-8 overflow-hidden">
            {/* Left: Filter Sidebar (Desktop) */}
            <aside className="hidden xl:block w-72 h-full shrink-0 animate-in slide-in-from-left duration-700">
                <InboxFilters 
                    status={activeStatus}
                    search={search}
                    onStatusChange={(s) => updateFilters({ status: s })}
                    onSearchChange={(s) => updateFilters({ search: s })}
                    counts={counts}
                />
            </aside>

            {/* Mobile/Tablet: Top Filters */}
            <div className="xl:hidden shrink-0 space-y-4">
                <InboxFilters 
                    status={activeStatus}
                    search={search}
                    onStatusChange={(s) => updateFilters({ status: s })}
                    onSearchChange={(s) => updateFilters({ search: s })}
                    counts={counts}
                />
            </div>

            {/* Center: List Pane */}
            <section className="flex-1 min-w-0 bg-card rounded-4xl border border-white/3 overflow-hidden shadow-2xl animate-in fade-in duration-1000 relative">
                <MessageList 
                    messages={messages}
                    loading={isLoading}
                    selectedId={selectedMessage?.id}
                    onSelect={handleSelectMessage}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                />

                {/* Bulk Toolbar */}
                {selectedIds.length > 0 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 bg-foreground/95 dark:bg-background/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-500 z-50">
                        <div className="flex items-center gap-3 px-4 border-r border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground dark:text-primary">
                                {selectedIds.length} COMMUNIQUE ENQUEUED
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                size="sm" 
                                onClick={() => handleBulkUpdate('resolved')}
                                className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 transition-all hover:scale-105"
                            >
                                <CheckCircle className="w-3 h-3" /> Resolve
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleBulkUpdate('archived')}
                                className="h-10 px-6 border-white/10 text-white hover:bg-white/5 rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 transition-all hover:scale-105"
                            >
                                <Archive className="w-3 h-3" /> Archive
                            </Button>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => setSelectedIds([])}
                                className="h-10 w-10 text-white/40 hover:text-white rounded-xl"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </section>

            {/* Right: Message Detail Detail (Desktop/Large) */}
            <section className="hidden lg:block w-[450px] 2xl:w-[550px] shrink-0 bg-card rounded-4xl border border-white/3 shadow-inner overflow-hidden animate-in slide-in-from-right duration-700">
                <MessageDetail 
                    message={selectedMessage}
                    onUpdateStatus={handleUpdateStatus}
                    onRevert={handleRevert}
                    onDelete={(id) => toast.error("Permanent deletion protocol requires manual confirmation via the master registry.")}
                />
            </section>

            {/* Mobile Overlay: Detail Pane (Full Screen Dialog ideally, handled here via absolute UI for simplicity) */}
            {selectedMessage && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background animate-in slide-in-from-bottom duration-500 overflow-y-auto">
                    <div className="absolute top-6 left-6 z-50">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSelectedMessage(null)}
                            className="w-12 h-12 bg-muted/50 rounded-2xl"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                    <MessageDetail 
                        message={selectedMessage}
                        onUpdateStatus={handleUpdateStatus}
                        onRevert={handleRevert}
                        onDelete={(id) => setSelectedMessage(null)}
                    />
                </div>
            )}
        </div>
    )
}
