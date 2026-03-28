"use client";

import { Newspaper } from 'lucide-react';
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

function AnnouncementsWidget() {
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
                    <div className="p-3 2xl:p-6 bg-slate-50 rounded-xl 2xl:rounded-2xl border border-slate-100 group hover:border-primary/20 transition-colors">
                        <Badge variant="outline" className="text-[12px] h-auto py-1 font-black text-primary border-primary/20 bg-primary/5 mb-4 flex items-center gap-1.5 w-fit">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                            </span>
                            Call for Papers
                        </Badge>
                        <p className="font-bold text-slate-700 m-0">
                            IJITEST invites original research articles for the upcoming Volume 1 (2026).
                        </p>
                    </div>
                    {/*<div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-secondary/20 transition-colors">
                        <Badge variant="outline" className="text-[8px] h-4 font-black  text-secondary border-secondary/20 bg-secondary/5 mb-1">SJIF</Badge>
                        <p className="text-xs font-bold text-slate-700 leading-wider">
                            SJIF Impact Factor (2024): 8.16
                        </p>
                    </div>*/}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default memo(AnnouncementsWidget);
