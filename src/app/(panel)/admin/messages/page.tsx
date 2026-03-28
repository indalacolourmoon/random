"use client";

import { MessageSquare, Mail, Calendar, CheckCircle, Eye, Archive, Search, Trash2, User, Clock, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { useMessages, useUpdateMessageStatus, useDeleteMessage } from '@/hooks/queries/useMessages';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export default function Messages() {
    const { data: messages = [], isLoading: loading } = useMessages();
    const updateMutation = useUpdateMessageStatus();
    const deleteMutation = useDeleteMessage();

    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'inbox' | 'archived'>('inbox');
    const [searchQuery, setSearchQuery] = useState('');

    // If the selected message no longer matches the current tab (e.g. was just archived), deselect it
    // This useEffect is kept as it depends on `messages` and `activeTab` which are still managed by state/hooks.
    // The `messages` array will be updated by react-query's invalidation.
    // useEffect(() => {
    //     if (selectedMessage) {
    //         const stillRelevant = messages.find(m => m.id === selectedMessage.id && (activeTab === 'inbox' ? m.status !== 'archived' : m.status === 'archived'));
    //         if (!stillRelevant) {
    //             setSelectedMessage(null);
    //         }
    //     }
    // }, [activeTab, messages, selectedMessage]);


    async function handleStatusChange(id: number, status: string) {
        try {
            await updateMutation.mutateAsync({ id, status });
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status });
            }
            toast.success(`Message marked as ${status}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to permanently delete this message?')) return;
        try {
            const res = await deleteMutation.mutateAsync(id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Message deleted");
                setSelectedMessage(null);
            }
        } catch (error) {
            toast.error("Failed to delete message");
        }
    }

    if (loading) {
        return (
            <div className="p-40 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-black text-muted-foreground tracking-widest text-xs uppercase animate-pulse">Connecting to Communication Server...</p>
            </div>
        );
    }

    const activeMessages = messages.filter(m => {
        const matchesTab = activeTab === 'inbox' ? m.status !== 'archived' : m.status === 'archived';
        const matchesSearch =
            (m.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (m.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (m.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <main className="h-[calc(100vh-100px)] flex flex-col gap-6 pb-6">

            {/* Header & Controls */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0 border-b border-primary/5 pb-6">
                <div className="space-y-2">
                    <h1 className=" font-black text-foreground tracking-widest uppercase leading-none">Inbox Hub</h1>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground border-l-2 border-primary/10 pl-4">Central Command for External Inquiries and Protocol Communications.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Tabs */}
                    <div className="flex items-center p-1 bg-muted/50 backdrop-blur-sm rounded-xl border border-primary/5 shadow-sm">
                        <button
                            onClick={() => setActiveTab('inbox')}
                            className={`relative px-8 py-3 rounded-xl text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inbox' ? 'text-primary-foreground bg-primary shadow-md dark:text-black' : 'text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary'}`}
                        >
                            Active Inbox
                            {unreadCount > 0 && activeTab !== 'inbox' && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('archived')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'archived' ? 'text-primary-foreground bg-primary shadow-md dark:text-black' : 'text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary'}`}
                        >
                            Archived Comm
                        </button>
                    </div>

                    <InputGroup className="flex-1 w-full sm:w-80 h-14 bg-muted border-none rounded-xl shadow-inner overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                        <InputGroupAddon className="pl-6 group-focus-within/input-group:text-primary transition-colors pr-2">
                            <Search className="w-5 h-5 text-primary/30" />
                        </InputGroupAddon>
                        <InputGroupInput
                            type="text"
                            placeholder="Query Intel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-full px-6 text-sm font-bold bg-transparent border-0 ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 text-foreground"
                        />
                    </InputGroup>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Sidebar List */}
                <Card className="lg:w-[380px] flex flex-col border-primary/5 shadow-vip overflow-hidden bg-card shrink-0 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10" />
                    <CardHeader className="p-8 bg-primary/[0.02] border-b border-primary/5 space-y-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-black text-primary tracking-[0.3em] uppercase">Communications</CardTitle>
                            <Badge className="h-8 px-4 bg-primary/10 text-primary text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black border-none uppercase tracking-widest rounded-lg">
                                {activeMessages.length} Records
                            </Badge>
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="divide-y divide-primary/5">
                            {activeMessages.map((m) => {
                                const isSelected = selectedMessage?.id === m.id;
                                const isUnread = m.status === 'unread';

                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedMessage(m);
                                            if (isUnread) handleStatusChange(m.id, 'read');
                                        }}
                                        className={`p-6 cursor-pointer transition-all hover:bg-primary/[0.02] relative group ${isSelected ? 'bg-primary/[0.04]' : ''}`}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${isSelected ? 'bg-primary' : isUnread ? 'bg-primary/30' : 'bg-transparent'}`} />
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-muted-foreground/60 uppercase tracking-widest truncate max-w-[150px]">
                                                {m.subject || 'No Subject'}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-black text-muted-foreground/40 uppercase tracking-widest">
                                                {new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className={` tracking-wider leading-wider mb-2 truncate uppercase ${isUnread ? 'font-black text-foreground' : 'font-bold text-muted-foreground'}`}>
                                            {m.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground/70 line-clamp-1 font-medium leading-relaxed group-hover:text-foreground transition-colors">
                                            {m.message}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                        {activeMessages.length === 0 && (
                            <div className="p-16 text-center space-y-4 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-primary/20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">Queue Empty</p>
                                    <p className="text-[9px] font-medium text-muted-foreground/40 tracking-widest">No matching records found.</p>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </Card>

                {/* Message Detail Pane */}
                <Card className="flex-1 border-primary/5 shadow-vip flex flex-col overflow-hidden bg-card rounded-xl relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10" />
                    {selectedMessage ? (
                        <>
                            <CardHeader className="p-4 sm:p-8 bg-primary/[0.02] border-b border-primary/5 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8">
                                    <div className="w-16 h-16 rounded-xl bg-muted border border-primary/10 flex items-center justify-center shadow-sm shrink-0">
                                        <User className="w-8 h-8 text-muted-foreground/40" />
                                    </div>
                                    <div className="space-y-2">
                                         className=" font-black text-foreground tracking-wider leading-none uppercase break-all sm:break-normal">{selectedMessage.name}</h2>
                                    <div className="flex items-center gap-4">
                                        <a href={`mailto:${selectedMessage.email}`} className="text-xs sm:text-sm font-black text-secondary hover:underline tracking-widest flex items-center gap-2 uppercase break-all sm:break-normal">
                                            <Mail className="w-4 h-4 shrink-0" /> <span className="truncate max-w-[200px] sm:max-w-none">{selectedMessage.email}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange(selectedMessage.id, selectedMessage.status === 'archived' ? 'read' : 'archived')}
                                    className={`flex-1 sm:flex-none h-12 px-2 sm:px-6 gap-2 sm:gap-3 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl transition-all ${selectedMessage.status === 'archived' ? 'border-primary bg-primary text-white dark:text-slate-900 hover:bg-primary/90' : 'border-primary/10 text-foreground hover:bg-muted'}`}
                                >
                                    <Archive className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="truncate">{selectedMessage.status === 'archived' ? 'Restore Active' : 'Archive'}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    className="h-12 w-12 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all font-black shrink-0"
                                    title="Sever Record"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardHeader>

                    <ScrollArea className="flex-1">
                        <div className="p-8 space-y-8 max-w-4xl mx-auto w-full">
                            {/* Action Header */}
                            <div className="flex flex-wrap items-center justify-between gap-6 py-5 px-8 bg-primary/[0.02] rounded-xl border border-primary/5 shadow-inner">
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-3 text-xs font-black text-muted-foreground/60 uppercase tracking-widest">
                                        <Calendar className="w-5 h-5" />
                                        <span>{new Date(selectedMessage.created_at).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                    <span className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                                        Status:
                                        <Badge variant="secondary" className="h-6 px-3 text-[10px] bg-primary/10 text-primary dark:text-primary dark:bg-primary/20 border-none shadow-sm font-black rounded-lg uppercase">{selectedMessage.status}</Badge>
                                    </span>
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-xs font-black text-muted-foreground/50 uppercase tracking-[0.3em] pl-4">
                                    <MessageSquare className="w-5 h-5" /> Decrypted Payload
                                </div>
                                <Card className="border-primary/10 bg-muted/30 shadow-inner overflow-hidden rounded-xl">
                                    <CardContent className="p-10">
                                        <h3 className=" font-black text-foreground tracking-wider mb-8 pb-8 border-b border-primary/5 leading-snug uppercase">RE: {selectedMessage.subject}</h3>
                                        <div className="text-sm font-medium text-foreground/80 leading-loose whitespace-pre-wrap selection:bg-primary/20">
                                            {selectedMessage.message}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-primary/5 bg-primary/[0.02] flex justify-end gap-4 rounded-b-[2rem]">
                        <Button asChild className="h-14 px-10 gap-3 font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 rounded-xl bg-primary text-white dark:text-slate-900 hover:scale-[1.02] transition-all cursor-pointer">
                            <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                                <Send className="w-5 h-5" /> Dispatch Journal Rebuttal
                            </a>
                        </Button>
                    </div>
                </>
                ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                    <div className="w-24 h-24 rounded-xl bg-primary/[0.03] border border-primary/5 flex items-center justify-center shadow-inner">
                        <Mail className="w-10 h-10 text-primary/20" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <h3 className=" font-black text-muted-foreground/60 uppercase tracking-[0.3em]">Standby Directive</h3>
                        <p className="text-[10px] font-medium text-muted-foreground/40 tracking-widest leading-relaxed">Engage a communication node from the left registry to initialize the transmission matrix.</p>
                    </div>
                </div>
                    )}
            </Card>
        </div>
        </main >
    );
}
