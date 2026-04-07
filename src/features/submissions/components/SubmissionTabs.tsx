"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

const statuses = [
    { label: 'All', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid / Waive Free', value: 'paid' },
    { label: 'Published', value: 'published' },
    { label: 'Rejected', value: 'rejected' },
];

export default function SubmissionTabs({ currentStatus = 'all' }: { currentStatus?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleTabClick = useCallback((status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === 'all') {
            params.delete('status');
        } else {
            params.set('status', status);
        }
        router.push(`?${params.toString()}`);
    }, [searchParams, router]);

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {statuses.map((tab) => {
                const isActive = currentStatus === tab.value;
                return (
                    <button
                        key={tab.value}
                        onClick={() => handleTabClick(tab.value)}
                        className={`relative px-8 2xl:px-14 py-4 rounded-xl text-xs font-bold tracking-widest transition-all whitespace-nowrap uppercase ${isActive
                            ? 'text-white'
                            : 'text-foreground/60 hover:text-primary bg-muted/50 border border-border/50 hover:bg-muted'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/10"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
