'use client';

import { 
    FileText, 
    Clock, 
    CheckCircle2, 
    AlertCircle
} from 'lucide-react';
import { useMemo } from 'react';
import {motion} from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card';

interface SubmissionStatsProps {
    stats: {
        total: number;
        submitted: number;
        underReview: number;
        published: number;
        rejected: number;
    }
}

export default function SubmissionStats({ stats }: SubmissionStatsProps) {
    const items = useMemo(() => [
        { 
            label: 'Total Manuscripts', 
            value: stats.total, 
            icon: FileText, 
            color: 'text-blue-600', 
            bg: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        { 
            label: 'Newly Submitted', 
            value: stats.submitted, 
            icon: Clock, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20'
        },
        { 
            label: 'In Peer-Review', 
            value: stats.underReview, 
            icon: AlertCircle, 
            color: 'text-amber-600', 
            bg: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20'
        },
        { 
            label: 'Published Works', 
            value: stats.published, 
            icon: CheckCircle2, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        }
    ], [stats]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Card className="border-border/50 shadow-sm bg-card hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden group">
                        <CardContent className="p-3 2xl:p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] 2xl:text-xs font-medium text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <h3 className="text-base 2xl:text-lg font-bold text-foreground">
                                        {item.value}
                                    </h3>
                                </div>
                                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center border ${item.borderColor}`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
