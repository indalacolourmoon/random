"use client";

import { FileStack, MessageSquareDot } from 'lucide-react';
import Link from 'next/link';
import { getNotificationCounts } from '@/actions/notifications';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const Badge = ({ count }: { count: number }) => (
    <>
        {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 2xl:h-7 2xl:w-7 items-center justify-center rounded-full bg-[#000066] text-[9px] sm:text-[10px] 2xl:text-xs font-bold text-white shadow-sm ring-2 ring-background z-20">
                {count > 9 ? '9+' : count}
            </span>
        )}
    </>
);

export default function NotificationCenter() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const { data: counts = { messages: 0, submissions: 0 } } = useQuery({
        queryKey: ['notificationCounts'],
        queryFn: getNotificationCounts,
        enabled: !!session?.user,
        select: (res) => res.success ? res.data : { messages: 0, submissions: 0 },
        refetchInterval: 30000, 
        staleTime: 30000,
    });

    if (!userRole || (userRole !== 'admin' && userRole !== 'editor' && userRole !== 'reviewer')) return null;

    const submissionLink = userRole === 'reviewer' 
        ? '/reviewer/reviews' 
        : userRole === 'editor' 
            ? '/editor/submissions' 
            : '/admin/submissions';
            
    const submissionTooltip = userRole === 'reviewer' 
        ? 'Assignments Pending Feedback' 
        : userRole === 'editor'
            ? 'Submissions Managed by You'
            : 'New Submissions Pending Screening';

    return (
        <TooltipProvider>
            <div className="flex items-center gap-3">
                {/* Submission Notifications */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={submissionLink} className="relative group">
                            <div className="h-10 w-10 2xl:h-12 2xl:w-12 rounded-xl flex items-center justify-center bg-[#000066]/5 text-[#000066] hover:bg-[#000066]/10 transition-all border border-border/50">
                                <FileStack className="w-5 h-5 2xl:w-6 2xl:h-6" />
                                <Badge count={counts.submissions} />
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border border-primary/10 text-foreground text-xs p-3 rounded-xl shadow-2xl">
                        <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            {counts.submissions} {submissionTooltip}
                        </p>
                    </TooltipContent>
                </Tooltip>

                {/* Message Notifications - Admins/Editors Only */}
                {userRole !== 'reviewer' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/admin/messages" className="relative group">
                                <div className="h-10 w-10 2xl:h-12 2xl:w-12 rounded-xl flex items-center justify-center bg-[#000066]/5 text-[#000066] hover:bg-[#000066]/10 transition-all border border-border/50">
                                    <MessageSquareDot className="w-5 h-5 2xl:w-6 2xl:h-6" />
                                    <Badge count={counts.messages} />
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-emerald-600 text-white dark:text-slate-900 font-bold p-3 rounded-xl shadow-2xl border-none">
                            <p className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 animate-pulse" />
                                {counts.messages} Unread Contact Inquiries
                            </p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}
