'use client';

import React from 'react';
import { 
    Plus, 
    AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SubmissionContainer from '@/features/submissions/components/SubmissionContainer';
import SubmissionTabs from '@/features/submissions/components/SubmissionTabs';
import SubmissionStats from '@/features/submissions/components/SubmissionStats';

interface SubmissionRegistryProps {
    submissions: any[];
    stats: {
        total: number;
        submitted: number;
        underReview: number;
        published: number;
        rejected: number;
    };
    currentStatus: string;
    role: 'admin' | 'editor';
}

export default function SubmissionRegistry({ 
    submissions, 
    stats, 
    currentStatus, 
    role 
}: SubmissionRegistryProps) {
    return (
        <section className="space-y-12 pb-20 max-w-7xl 2xl:max-w-[1900px] mx-auto">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border/50 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 2xl:w-20 2xl:h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                            <Plus className="w-6 h-6 2xl:w-10 2xl:h-10 text-primary" />
                        </div>
                        <h1 className="text-primary">
                            {role === 'admin' ? 'Manuscript Registry' : 'Editorial Hub'}
                        </h1>
                    </div>
                    <p className="opacity-60 border-l-4 border-primary/20 pl-6 py-1 max-w-2xl leading-relaxed">
                        {role === 'admin' 
                            ? 'Precision oversight of the global technical submission pipeline and peer-review integrity protocols.'
                            : 'Secure administration of the peer-review lifecycle and editorial decision workflows.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button asChild className="h-14 2xl:h-20 px-10 2xl:px-16 gap-3 bg-primary text-white rounded-xl shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all">
                        <Link href="/submit" className="flex items-center gap-3">
                            <Plus className="w-5 h-5 2xl:w-8 2xl:h-8" /> New Submission
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Performance Overviews */}
            <SubmissionStats stats={stats} />

            {/* Main Content Area */}
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card rounded-2xl">
                <CardContent className="p-0">
                    <div className="p-8 border-b border-border/50 bg-muted/30">
                        <SubmissionTabs currentStatus={currentStatus} />
                    </div>

                    <SubmissionContainer
                        submissions={submissions}
                        currentStatus={currentStatus}
                        role={role}
                    />

                    <div className="p-10 border-t border-border/50 flex items-center justify-center bg-muted/30">
                        <p className="opacity-60">
                            Registry Audit End | {submissions.length} Records in Selection
                        </p>
                    </div>
                </CardContent>
            </Card>

            {submissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 bg-muted/20 border border-dashed border-border/50 rounded-xl space-y-6">
                    <AlertTriangle className="w-14 h-14 text-muted-foreground/20 mb-2" />
                    <p className="opacity-40">No active records in this database segment</p>
                </div>
            )}
        </section>
    );
}
