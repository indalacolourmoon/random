"use client";

import React from 'react';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';

interface ExpertiseDossierProps {
    bio?: string;
}

export const ExpertiseDossier = React.memo(({ bio }: ExpertiseDossierProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black flex items-center gap-2 text-foreground dark:text-primary uppercase tracking-widest m-0">
                        <FileText className="w-5 h-5" /> Research Bio & Expertise
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Biography</Label>
                    <div className="relative">
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={bio}
                            placeholder="Tell us about your research expertise and background..."
                            rows={6}
                            className="bg-muted/30 border-border resize-none focus-visible:ring-primary shadow-sm rounded-xl p-6 leading-relaxed"
                        />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});

ExpertiseDossier.displayName = 'ExpertiseDossier';
