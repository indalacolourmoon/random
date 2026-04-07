'use client';

import { 
    FileText, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    TrendingUp
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item, idx) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Card className="border-border/50 shadow-sm bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
                        <CardContent className="p-8 2xl:p-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] 2xl:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                        {item.label}
                                    </p>
                                    <h3 className="text-3xl 2xl:text-5xl font-extrabold text-foreground tracking-tight">
                                        {item.value}
                                    </h3>
                                </div>
                                <div className={`w-14 h-14 2xl:w-20 2xl:h-20 rounded-xl ${item.bg} flex items-center justify-center border ${item.borderColor} shadow-sm group-hover:rotate-6 transition-transform duration-500`}>
                                    <item.icon className={`w-6 h-6 2xl:w-10 2xl:h-10 ${item.color}`} />
                                </div>
                            </div>
                            
                            <div className="mt-4 flex items-center gap-2 text-[10px] 2xl:text-sm font-bold text-muted-foreground uppercase tracking-tight">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span>Real-time Sync Active</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
