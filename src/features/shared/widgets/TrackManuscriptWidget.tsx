"use client";

import { Search } from 'lucide-react';
import { useState, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

function TrackManuscriptWidget() {
    const [paperId, setPaperId] = useState('');
    const router = useRouter();

    const handleTrack = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (paperId.trim()) {
            router.push(`/track?id=${paperId}`);
        }
    }, [paperId, router]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0 }}
        >
            <Card className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="p-5 pb-0 2xl:p-10 2xl:pb-0">
                    <CardTitle className="text-primary group-hover:text-primary transition-colors duration-300">Track Your Paper</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-4 2xl:p-10 2xl:pt-8">
                    <form onSubmit={handleTrack} className="space-y-3 2xl:space-y-6">
                        <Input
                            type="text"
                            placeholder="Manuscript ID"
                            value={paperId}
                            onChange={(e) => setPaperId(e.target.value)}
                            className="bg-muted/30 border-border/50 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <Button type="submit" className="btn-primary w-full mt-2 gap-2">
                            <Search className="w-3.5 h-3.5 2xl:w-6 2xl:h-6 group-hover:scale-110 transition-transform" /> Track Manuscript
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default memo(TrackManuscriptWidget);
