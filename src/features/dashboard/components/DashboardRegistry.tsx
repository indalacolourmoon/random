'use client';

import React from 'react';
import {
    FileStack, Users, Activity, AlertCircle, TrendingUp, ArrowRight, UserPlus, FileText, Clock, ExternalLink,
    CreditCard, ClipboardList, Download, Shield, ShieldCheck, Box, HardDrive, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberTicker } from '@/components/ui/number-ticker';

interface Stat {
    label: string;
    value: number | string;
    icon: string; // Changed from ReactNode to string
    variant: string;
    prefix?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
    FileStack, Users, Activity, AlertCircle, TrendingUp, ArrowRight, UserPlus, FileText, Clock, ExternalLink,
    CreditCard, ClipboardList, Download, Shield, ShieldCheck, Box, HardDrive, BookOpen
};

interface DashboardRegistryProps {
    role: 'admin' | 'editor';
    user: any;
    stats: Stat[];
    recentSubmissions: any[];
    mySubmissions: any[];
    healthMetrics: any[];
    pendingApplications?: any[];
    allStaff?: any[];
    extraActions?: React.ReactNode;
    recentSubmissionsTitle?: string;
    queueTabLabel?: string;
    children?: React.ReactNode;
    metricsLabels?: {
        pubRate: string;
        revRate: string;
    };
    percentages?: {
        pub: number;
        rev: number;
    };
}

export function DashboardRegistry({
    role,
    user,
    stats,
    recentSubmissions,
    mySubmissions,
    healthMetrics,
    pendingApplications = [],
    allStaff = [],
    extraActions,
    recentSubmissionsTitle = "Submissions",
    queueTabLabel = "Queue",
    metricsLabels = { pubRate: "Publication Rate", revRate: "Review Rate" },
    percentages = { pub: 0, rev: 0 },
    children
}: DashboardRegistryProps) {
    return (
        <section className="space-y-6">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-4 border-b border-border/50">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-primary/10 text-primary border-none px-3 py-1 rounded-md">
                            {role === 'admin' ? 'admin' : 'editor'}
                        </Badge>
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="opacity-60">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="text-primary">
                        {role === 'admin' ? 'Admin Dashboard' : 'Editor Dashboard'}
                    </h1>
                    <p className="opacity-60 mt-1">
                        Logged in as <span className="text-foreground">{user?.fullName || user?.name}</span>
                    </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-3">
                    {extraActions}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/50 shadow-sm bg-card hover:shadow-md transition-all rounded-xl overflow-hidden group">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${stat.variant === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                        stat.variant === 'blue' ? 'bg-blue-50 text-blue-600' :
                                            stat.variant === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                                stat.variant === 'primary' ? 'bg-primary/5 text-primary' :
                                                    'bg-amber-50 text-amber-600'
                                    }`}>
                                    <div className="[&>svg]:w-5 [&>svg]:h-5">
                                        {(() => {
                                            const Icon = ICON_MAP[stat.icon] || Box;
                                            return <Icon />;
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="opacity-60">{stat.label}</p>
                                <h3 className="text-foreground">
                                    {typeof stat.value === 'number' ? <NumberTicker value={stat.value} prefix={stat.prefix} /> : stat.value}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-muted/50 p-1 w-full flex flex-wrap sm:inline-flex justify-start sm:justify-center h-auto gap-1 rounded-xl border border-primary/5">
                    <TabsTrigger value="overview" className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">{queueTabLabel}</TabsTrigger>
                    <TabsTrigger value="my-papers" className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Papers</TabsTrigger>
                    <TabsTrigger value="infrastructure" className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Status</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="border-primary/5 shadow-sm bg-card/50">
                                <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-border/50">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2 text-primary">
                                            {recentSubmissionsTitle}
                                        </CardTitle>
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="h-9 group text-primary hover:bg-primary/5 cursor-pointer rounded-lg">
                                        <Link href={`/${role}/submissions`} className="flex items-center gap-2 cursor-pointer">
                                            View all <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-primary/5">
                                        {recentSubmissions.length === 0 ? (
                                            <div className="p-12 text-center text-xs font-medium text-muted-foreground/50">No submissions found.</div>
                                        ) : recentSubmissions.map((sub: any) => (
                                            <Link
                                                href={`/${role}/submissions/${sub.id}`}
                                                key={sub.paper_id}
                                                className="flex items-center justify-between p-5 hover:bg-primary/2 transition-all group"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-12 h-10 rounded-lg bg-muted flex flex-col items-center justify-center font-bold text-[10px] text-muted-foreground border border-border/50 shrink-0">
                                                        <span>ID</span>
                                                        <span className="text-primary font-bold">{sub.paper_id.split('-').pop()}</span>
                                                    </div>
                                                    <div className="min-w-0 px-2">
                                                        <h4 className="text-foreground truncate group-hover:text-primary transition-colors leading-tight mb-1">{sub.title || "Untitled Project"}</h4>
                                                        <p className="opacity-60">
                                                            {sub.author_name} • {new Date(sub.submitted_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={`border-none text-[10px] font-bold py-1 px-3 rounded-md ${sub.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' :
                                                        sub.status === 'retracted' ? 'bg-rose-500/10 text-rose-600' :
                                                            'bg-primary/10 text-primary'}`}>
                                                    {sub.status.replace('_', ' ')}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-6 border-primary/5 bg-card/50">
                                    <h4 className="opacity-60 mb-4">Statistics</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                                <span>{metricsLabels.pubRate}</span>
                                                <span>{percentages.pub.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${percentages.pub}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                                <span>{metricsLabels.revRate}</span>
                                                <span>{percentages.rev.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${percentages.rev}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                                <div className="space-y-4">
                                    {children}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {role === 'admin' && pendingApplications.length > 0 && (
                                <Card className="border-primary/5 shadow-sm bg-card/50">
                                    <CardHeader className="pb-3 border-b border-primary/5 bg-primary/2">
                                        <CardTitle className="text-foreground flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4 text-primary" /> Applications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-primary/5">
                                            {pendingApplications.map((app: any) => (
                                                <div key={app.id} className="p-5 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="opacity-60 px-2 h-5 rounded-md border-primary/10 text-primary/60">{app.applicationType || app.type}</Badge>
                                                        <span className="opacity-60">{new Date(app.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h5 className="text-foreground">{app.fullName}</h5>
                                                    {role === 'admin' && (
                                                        <Button asChild size="sm" variant="ghost" className="w-full h-9 border border-primary/5 rounded-lg hover:bg-primary/5 cursor-pointer">
                                                            <Link href="/admin/applications" className="cursor-pointer">Process</Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {role === 'editor' && (
                                <Card className="border-primary/5 shadow-sm bg-card/50 h-full">
                                    <CardHeader className="p-6 border-b border-primary/5 bg-primary/2">
                                        <CardTitle className="text-foreground flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4 text-primary" /> Tasks
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 mt-4 space-y-4">
                                        {[
                                            { icon: <FileStack />, label: 'Manuscript Screening' },
                                            { icon: <ShieldCheck />, label: 'Peer Review Oversight' },
                                            { icon: <AlertCircle />, label: 'Workflow Deadlines' }
                                        ].map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 group">
                                                <div className="w-5 h-5 opacity-40 group-hover:text-primary transition-colors shrink-0">
                                                    {task.icon}
                                                </div>
                                                <span className="opacity-60">{task.label}</span>
                                            </div>
                                        ))}
                                        <div className="mt-8 pt-8 border-t border-primary/5 text-center">
                                            <p className="opacity-60 mb-6 px-4 leading-relaxed">System monitoring active.</p>
                                            <Button asChild className="w-full h-10 bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90 transition-all cursor-pointer">
                                                <Link href="/editor/submissions" className="flex items-center gap-2 justify-center cursor-pointer">
                                                    View Queue <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="my-papers" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mySubmissions.length === 0 ? (
                            <Card className="md:col-span-2 lg:col-span-3 border-dashed border-2 bg-primary/2 py-16 text-center rounded-xl border-primary/10">
                                <div className="max-w-xs mx-auto space-y-4">
                                    <div className="w-16 h-16 rounded-xl bg-card border border-primary/5 flex items-center justify-center mx-auto shadow-sm">
                                        <FileText className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="opacity-60 px-8">Submit and track your own manuscripts from the portal.</p>
                                    <Button asChild className="h-10 px-8 bg-primary text-white rounded-lg cursor-pointer">
                                        <Link className="cursor-pointer" href="/submit">Submit Paper</Link>
                                    </Button>
                                </div>
                            </Card>
                        ) : mySubmissions.map((paper: any) => (
                            <Card key={paper.id} className="border-primary/5 shadow-sm bg-card/50 hover:bg-card hover:border-primary/20 transition-all group overflow-hidden rounded-xl">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="opacity-40 px-2 py-0.5 rounded-md">ID: {paper.paper_id}</Badge>
                                        <Badge className={`py-1 px-3 border-none rounded-md ${paper.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' :
                                            paper.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' :
                                                'bg-indigo-500/10 text-indigo-600'
                                            }`}>
                                            {paper.status}
                                        </Badge>
                                    </div>
                                    <h3 className="text-foreground line-clamp-2 h-12 group-hover:text-primary transition-colors leading-tight">{paper.title}</h3>
                                    <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                                        <span className="opacity-60 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(paper.submitted_at).toLocaleDateString()}</span>
                                        <Button asChild variant="ghost" size="sm" className="h-9 px-4 text-primary hover:bg-primary/5 rounded-lg cursor-pointer">
                                            <Link href={`/track?id=${paper.paper_id}`} className="flex items-center gap-2 cursor-pointer">
                                                Track <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                                <div className="h-1 bg-primary/5 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ${paper.status === 'published' ? 'bg-emerald-500' : 'bg-primary'}`}
                                        style={{ width: paper.status === 'published' ? '100%' : '15%' }}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="infrastructure" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-primary/5 shadow-sm bg-card/50 overflow-hidden rounded-xl">
                            <CardHeader className="p-6 border-b border-primary/5 flex flex-row items-center justify-between bg-primary/2">
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Users className="w-4 h-4 text-primary" /> Active Users
                                </CardTitle>
                                {role === 'admin' && (
                                    <Button size="sm" asChild className="h-9 px-4 bg-primary text-white hover:bg-primary/90 rounded-lg cursor-pointer">
                                        <Link className="cursor-pointer" href="/admin/users">Manage Users</Link>
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {allStaff.length === 0 ? (
                                    <div className="p-16 text-center text-xs font-medium text-muted-foreground/40">No users found.</div>
                                ) : (
                                    <div className="divide-y divide-primary/5">
                                        {allStaff.map((staff: any) => (
                                            <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-primary/2 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-bold text-sm border border-primary/5 shadow-inner">
                                                        {staff.full_name?.charAt(0) || staff.email.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-foreground leading-none mb-1">{staff.full_name || 'User'}</h5>
                                                        <p className="opacity-60">{staff.email}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`h-7 border-none px-3 rounded-md ${staff.role === 'admin' ? 'bg-rose-500/10 text-rose-600' :
                                                        staff.role === 'editor' ? 'bg-blue-500/10 text-blue-600' :
                                                            'bg-emerald-500/10 text-emerald-600'
                                                    }`}>
                                                    {staff.role}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-primary/5 shadow-sm bg-card/50 transition-colors rounded-xl">
                            <CardHeader className="p-6 pb-2 border-b border-primary/5">
                                <CardTitle className="text-foreground">System Status</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                {healthMetrics.map((metric) => (
                                    <div key={metric.label} className="p-4 rounded-xl bg-primary/2 border border-primary/5 space-y-1 hover:bg-primary/5 transition-all group">
                                        <div className="flex justify-between items-center opacity-60">
                                            <span className="flex items-center gap-1.5">
                                                <div className="[&>svg]:w-3.5 [&>svg]:h-3.5 group-hover:text-primary transition-colors">
                                                    {(() => {
                                                        const Icon = ICON_MAP[metric.icon as string] || Box;
                                                        return <Icon />;
                                                    })()}
                                                </div>
                                                {metric.label}
                                            </span>
                                            <span className={metric.status === 'Optimal' || metric.status === 'Healthy' || metric.status === 'Excellent' ? 'text-emerald-500' : 'text-amber-500'}>{metric.status}</span>
                                        </div>
                                        <p className="text-foreground">{metric.value}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
}

DashboardRegistry.displayName = 'DashboardRegistry';
