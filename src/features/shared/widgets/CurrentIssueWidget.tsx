"use client";

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLatestIssue } from '@/hooks/queries/usePublic';

function CurrentIssueWidget() {
    const { data: dbIssue, isLoading } = useLatestIssue();

    const currentStatus = useMemo(() => {
        if (dbIssue) {
            return {
                volume: dbIssue.volume_number,
                issue: dbIssue.issue_number,
                date: `${dbIssue.month_range} ${dbIssue.year}`
            };
        }

        // Fallback dynamic estimation
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return {
            volume: year - 2025,
            issue: now.getMonth() + 1,
            date: `${monthNames[now.getMonth()]} ${year}`
        };
    }, [dbIssue]);

    if (isLoading) return (
        <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-white group rounded-[2.5rem]">
            <CardContent className="p-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary/20" />
            </CardContent>
        </Card>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-white group rounded-[2.5rem]">
                <CardHeader className="p-6 pb-2 2xl:p-10 2xl:pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
                            <BookOpen className="w-5 h-5 2xl:w-8 2xl:h-8" />
                        </div>
                        <CardTitle className="text-primary m-0">Current Issue</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-4 2xl:p-10 2xl:pt-8 space-y-6 2xl:space-y-10">
                    <div className="space-y-1.5 2xl:space-y-3 pl-2 sm:pl-4 border-l-4 border-secondary/30">
                        <div className="flex items-center gap-2">
                            <p className="text-secondary m-0">Volume {currentStatus.volume}</p>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <p className="text-secondary m-0">Issue {currentStatus.issue}</p>
                        </div>
                        <p className="font-bold text-slate-600 m-0">{currentStatus.date}</p>
                    </div>
 
                    <div className="pt-2">
                        <Button asChild className="btn-primary w-full">
                            <Link href="/archives" className="flex items-center justify-center gap-2">
                                <span>Open Articles</span>
                                <ChevronRight className="w-4 h-4 2xl:w-6 2xl:h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default memo(CurrentIssueWidget);
