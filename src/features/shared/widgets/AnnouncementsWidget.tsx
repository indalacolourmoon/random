"use client";

import { Newspaper, Loader2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { useLatestIssue } from '@/hooks/queries/usePublic';

function AnnouncementsWidget() {
    const { data: dbIssue, isLoading } = useLatestIssue();

    const currentStatus = useMemo(() => {
        if (dbIssue) {
            return {
                volume: dbIssue.volumeNumber,
                issue: dbIssue.issueNumber,
                date: `${dbIssue.monthRange} ${dbIssue.year}`
            };
        }

        return null;
    }, [dbIssue]);

    if (!currentStatus) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <Card className="border-border/50 shadow-md overflow-hidden">
                <CardHeader className="p-5 pb-0 2xl:p-10 2xl:pb-0">
                    <div className="flex items-center gap-2">
                        <Newspaper className="w-6 h-6 2xl:w-8 2xl:h-8 text-secondary" />
                        <CardTitle className="m-0">Announcements</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-5 pt-4 2xl:p-10 2xl:pt-8 space-y-4 text-justify">
                    {isLoading ? (
                        <div className="p-8 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary/20" />
                        </div>
                    ) : (
                        <div className="p-3 2xl:p-6 bg-slate-50 rounded-xl 2xl:rounded-2xl border border-slate-100 group hover:border-primary/20 transition-colors">
                            <Badge variant="outline" className="text-[12px] h-auto py-1 font-black text-primary border-primary/20 bg-primary/5 mb-4 flex items-center gap-1.5 w-fit">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </span>
                                Current Issue
                            </Badge>
                            <div className="space-y-2">
                                <p className="font-bold text-slate-700 m-0">
                                    Volume {currentStatus.volume}, Issue {currentStatus.issue} ({currentStatus.date}) is now published.
                                </p>
                                <a href="/archives" className="text-sm font-bold text-secondary flex items-center gap-1 hover:text-primary transition-colors">
                                    Open Articles
                                </a>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default memo(AnnouncementsWidget);
