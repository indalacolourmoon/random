"use client";

import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';

interface ExpertiseDossierProps {
    bio?: string;
}

export const ExpertiseDossier = React.memo(({ bio }: ExpertiseDossierProps) => {
    return (
        <div>
            <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                        <FileText className="w-5 h-5 text-[#000066]" /> Bio & Expertise
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label htmlFor="bio" className="text-[10px] font-bold uppercase tracking-wider text-[#000066] ml-1">Professional Biography</Label>
                    <div className="relative">
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={bio}
                            placeholder="Tell us about your research expertise and background..."
                            rows={6}
                            className="bg-muted/20 border-border/50 resize-none focus-visible:ring-primary shadow-sm rounded-lg p-6 leading-relaxed text-xs xl:text-sm"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

ExpertiseDossier.displayName = 'ExpertiseDossier';
