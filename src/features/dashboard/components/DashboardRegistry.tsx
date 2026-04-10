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
    icon: string;
    variant: string;
    prefix?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
    FileStack, Users, Activity, AlertCircle, TrendingUp, ArrowRight, UserPlus, FileText, Clock, ExternalLink,
    CreditCard, ClipboardList, Download, Shield, ShieldCheck, Box, HardDrive, BookOpen
};

interface DashboardRegistryProps {
    role: 'admin' | 'editor' | 'author';
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
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-6 border-b border-border/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-[#000066]/5 text-[#000066] border-[#000066]/10 px-3 py-0.5 rounded-md text-[10px] font-medium">
                            {role}
                        </Badge>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="text-xl xl:text-2xl font-semibold text-[#000066]">
                        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Logged in as <span className="font-medium text-foreground">{user?.fullName || user?.name || 'User'}</span>
                    </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-3">
                    {extraActions}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/50 shadow-sm bg-card transition-all rounded-xl">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-border/5 ${
                                    stat.variant === 'primary' ? 'bg-[#000066]/5 text-[#000066]' : 'bg-muted/50 text-muted-foreground'
                                }`}>
                                    <div className="[&>svg]:w-5 [&>svg]:h-5">
                                        {(() => {
                                            const Icon = ICON_MAP[stat.icon] || Box;
                                            return <Icon />;
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                                    {typeof stat.value === 'number' ? <NumberTicker value={stat.value} prefix={stat.prefix} /> : stat.value}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-muted/50 flex flex-wrap sm:inline-flex justify-start h-auto gap-1 rounded-xl border border-border/50 p-1">
                    <TabsTrigger value="overview" className="px-6 py-2 rounded-lg data-[state=active]:bg-[#000066] data-[state=active]:text-white font-medium transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="my-papers" className="px-6 py-2 rounded-lg data-[state=active]:bg-[#000066] data-[state=active]:text-white font-medium transition-all">My Papers</TabsTrigger>
                    <TabsTrigger value="infrastructure" className="px-6 py-2 rounded-lg data-[state=active]:bg-[#000066] data-[state=active]:text-white font-medium transition-all">Health</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="border-border/50 shadow-sm bg-card">
                                <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/50">
                                    <CardTitle className="text-lg font-semibold text-[#000066]">
                                        {recentSubmissionsTitle}
                                    </CardTitle>
                                    <Button asChild variant="ghost" size="sm" className="text-[#000066] hover:bg-[#000066]/5 rounded-lg">
                                        <Link href={`/${role}/submissions`} className="flex items-center gap-1">
                                            View all <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/30">
                                        {recentSubmissions.length === 0 ? (
                                            <div className="p-12 text-center text-xs text-muted-foreground/50">No submissions found.</div>
                                        ) : recentSubmissions.map((sub: any) => (
                                            <Link
                                                href={`/${role}/submissions/${sub.id}`}
                                                key={sub.id}
                                                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-8 rounded bg-muted flex flex-col items-center justify-center text-[9px] font-bold text-muted-foreground border border-border/50 shrink-0">
                                                        <span className="text-[#000066]">{sub.paper_id?.split('-').pop() || 'N/A'}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-medium text-foreground truncate group-hover:text-[#000066] transition-colors mb-0.5">{sub.title || "Untitled Project"}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {sub.author_name} • {new Date(sub.submitted_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border-none ${
                                                        sub.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                                                        sub.status === 'retracted' ? 'bg-rose-50 text-rose-600' :
                                                        'bg-[#000066]/5 text-[#000066]'}`}>
                                                    {sub.status?.replace('_', ' ')}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-5 border-border/50 bg-card">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Activity Overview</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-semibold mb-1.5 uppercase tracking-tighter">
                                                <span>{metricsLabels.pubRate}</span>
                                                <span>{percentages.pub.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${percentages.pub}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] font-semibold mb-1.5 uppercase tracking-tighter">
                                                <span>{metricsLabels.revRate}</span>
                                                <span>{percentages.rev.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-[#000066]" style={{ width: `${percentages.rev}%` }} />
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
                                <Card className="border-border/50 bg-card">
                                    <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4 text-[#000066]" /> Pending Applications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-border/30">
                                            {pendingApplications.map((app: any) => (
                                                <div key={app.id} className="p-4 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="text-[10px] font-medium h-5 rounded px-2">{app.applicationType || app.type}</Badge>
                                                        <span className="text-[10px] text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h5 className="text-sm font-medium">{app.fullName}</h5>
                                                    <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs rounded-lg hover:bg-muted">
                                                        <Link href="/admin/reviewer-applications">Review</Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {role === 'editor' && (
                                <Card className="border-border/50 bg-card h-full">
                                    <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4 text-[#000066]" /> Active Tasks
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        {[
                                            { icon: <FileStack className="w-4 h-4" />, label: 'Manuscript Screening' },
                                            { icon: <ShieldCheck className="w-4 h-4" />, label: 'Peer Review Oversight' },
                                            { icon: <AlertCircle className="w-4 h-4" />, label: 'Workflow Deadlines' }
                                        ].map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground group">
                                                <div className="group-hover:text-[#000066] transition-colors">
                                                    {task.icon}
                                                </div>
                                                <span>{task.label}</span>
                                            </div>
                                        ))}
                                        <div className="pt-6 border-t border-border/50 text-center">
                                            <Button asChild className="w-full h-10 bg-[#000066] text-white rounded-lg shadow-sm hover:bg-[#000066]/90 transition-all">
                                                <Link href="/editor/submissions" className="flex items-center gap-2 justify-center">
                                                    Open Queue <ArrowRight className="w-4 h-4" />
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
                            <Card className="md:col-span-2 lg:col-span-3 border-dashed border bg-muted/20 py-12 text-center rounded-xl border-border">
                                <div className="max-w-xs mx-auto space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mx-auto">
                                        <FileText className="w-6 h-6 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-sm text-muted-foreground px-8">Submit and track your own manuscripts from the portal.</p>
                                    <Button asChild className="h-9 px-6 bg-[#000066] text-white rounded-lg">
                                        <Link href="/submit">Submit Paper</Link>
                                    </Button>
                                </div>
                            </Card>
                        ) : mySubmissions.map((paper: any) => (
                            <Card key={paper.id} className="border-border/50 shadow-sm bg-card hover:border-[#000066]/20 transition-all group overflow-hidden rounded-xl">
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 rounded">ID: {paper.paper_id}</Badge>
                                        <Badge className={`text-[10px] font-semibold py-0.5 px-2.5 border-none rounded ${
                                                paper.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                                                paper.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                'bg-[#000066]/5 text-[#000066]'
                                            }`}>
                                            {paper.status}
                                        </Badge>
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 h-10 group-hover:text-[#000066] transition-colors leading-tight">{paper.title}</h3>
                                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(paper.submitted_at).toLocaleDateString()}</span>
                                        <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-xs text-[#000066] hover:bg-[#000066]/5 rounded-lg">
                                            <Link href={`/track?id=${paper.paper_id}`} className="flex items-center gap-1.5">
                                                Track <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                                <div className="h-1 bg-muted overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ${paper.status === 'published' ? 'bg-emerald-500' : 'bg-[#000066]'}`}
                                        style={{ width: paper.status === 'published' ? '100%' : '20%' }}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="infrastructure" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-border/50 bg-card overflow-hidden rounded-xl">
                            <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between bg-muted/20">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                    <Users className="w-4 h-4 text-[#000066]" /> Active Users
                                </CardTitle>
                                {role === 'admin' && (
                                    <Button size="sm" asChild className="h-8 px-4 bg-[#000066] text-white rounded-lg">
                                        <Link href="/admin/users">Manage</Link>
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {allStaff.length === 0 ? (
                                    <div className="p-12 text-center text-xs text-muted-foreground/40">No users found.</div>
                                ) : (
                                    <div className="divide-y divide-border/30">
                                        {allStaff.map((staff: any) => (
                                            <div key={staff.id} className="p-3 px-4 flex items-center justify-between hover:bg-muted/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#000066]/5 text-[#000066] flex items-center justify-center font-bold text-xs border border-[#000066]/5">
                                                        {staff.full_name?.charAt(0) || staff.email?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-medium text-foreground leading-none mb-1">{staff.full_name || 'User'}</h5>
                                                        <p className="text-[10px] text-muted-foreground">{staff.email}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`text-[9px] font-semibold h-5 border-none px-2 rounded ${
                                                        staff.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                                                        staff.role === 'editor' ? 'bg-[#000066]/5 text-[#000066]' :
                                                        'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                    {staff.role}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card rounded-xl">
                            <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
                                <CardTitle className="text-sm font-semibold">System Health</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                {healthMetrics.map((metric) => (
                                    <div key={metric.label} className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-0.5 hover:bg-muted/30 transition-all">
                                        <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                {(() => {
                                                    const Icon = ICON_MAP[metric.icon as string] || Box;
                                                    return <Icon className="w-3 h-3" />;
                                                })()}
                                                {metric.label}
                                            </span>
                                            <span className={metric.status === 'Optimal' || metric.status === 'Healthy' || metric.status === 'Excellent' ? 'text-emerald-500' : 'text-amber-500'}>{metric.status}</span>
                                        </div>
                                        <p className="text-sm font-medium text-foreground">{metric.value}</p>
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
