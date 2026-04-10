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
        <Card className="border-border/50 bg-card rounded-xl shadow-sm transition-all group">
            <CardHeader className="p-5 pb-0">
                <CardTitle className="text-sm font-semibold text-primary">Track Manuscript</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-4">
                <form onSubmit={handleTrack} className="space-y-3">
                    <Input
                        type="text"
                        placeholder="Manuscript ID"
                        value={paperId}
                        onChange={(e) => setPaperId(e.target.value)}
                        className="h-10 bg-muted/20 border-border/50 text-xs focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                    />
                    <Button type="submit" className="w-full h-10 bg-[#000066] hover:bg-[#000088] text-white font-bold text-[10px] tracking-wider rounded-lg transition-all shadow-sm uppercase gap-2">
                        <Search className="w-3.5 h-3.5" /> Track
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default memo(TrackManuscriptWidget);
