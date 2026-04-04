'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

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

    const handleTabClick = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === 'all') {
            params.delete('status');
        } else {
            params.set('status', status);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {statuses.map((tab) => {
                const isActive = currentStatus === tab.value;
                return (
                    <button
                        key={tab.value}
                        onClick={() => handleTabClick(tab.value)}
                        className={`relative px-8 2xl:px-14 py-3 2xl:py-6 rounded-2xl 2xl:rounded-4xl text-xs 2xl:text-xl font-black tracking-widest transition-all whitespace-nowrap ${isActive
                            ? 'text-white dark:text-slate-900 cursor-pointer'
                            : 'text-muted-foreground hover:text-foreground bg-card border border-border shadow-sm cursor-pointer'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20"
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
