import { getAuthorSubmission, checkResubmissionEligibility } from "@/actions/author-submissions";
import { notFound } from "next/navigation";
import { ResubmissionForm } from "../_components/ResubmissionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, AlertTriangle } from "lucide-react";
import Link from "next/link";
import dayjs from "@/lib/dayjs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function AuthorSubmissionDetailsPage({ params }: { params: { id: string } }) {
    const submissionId = parseInt(params.id);
    const subResponse = await getAuthorSubmission(submissionId);
    if (!subResponse.success || !subResponse.data) return notFound();
    const sub = subResponse.data;

    const eligResponse = await checkResubmissionEligibility(submissionId);
    const eligibility = eligResponse.data || { eligible: false, daysRemaining: 0 };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'under_review': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'revision_requested': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-primary">Manuscript Details</h1>
                    <div className="flex items-center gap-3 text-sm text-primary/40 font-bold uppercase tracking-widest leading-none">
                        <span>{sub.paperId}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                        <span>Submitted on {dayjs(sub.submittedAt).format("MMMM DD, YYYY")}</span>
                    </div>
                </div>
                <Badge className={`px-5 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${getStatusColor(sub.status)}`}>
                    {sub.status.replace('_', ' ')}
                </Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Details (Left Col) */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-primary/10 shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/1 border-b border-primary/5">
                            <CardTitle className="text-xl font-black text-primary">Abstract & Metadata</CardTitle>
                            <CardDescription>Current version metadata for your manuscript.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-primary leading-tight">{sub.title}</h3>
                                <p className="text-sm text-primary/60 italic leading-relaxed">{sub.abstract}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {sub.keywords?.split(',').map((kw: string) => (
                                    <Badge key={kw} variant="outline" className="px-3 py-1 rounded-lg border-primary/10 text-xs font-bold text-primary/50">
                                        {kw.trim()}
                                    </Badge>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-primary/5 grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Current Version</span>
                                    <p className="text-sm font-bold text-primary">v{sub.versionNumber}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Last Updated</span>
                                    <p className="text-sm font-bold text-primary">{dayjs(sub.updatedAt!).format("MMM DD, YYYY")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Review Comments - Placeholder for Author View Logic */}
                    {/* (Need to ensure review comments are fetched in getAuthorSubmission) */}

                    {/* Resubmission Section */}
                    {eligibility.eligible && (
                        <ResubmissionForm 
                            submissionId={submissionId} 
                            paperId={sub.paperId} 
                            daysRemaining={eligibility.daysRemaining || 15} 
                        />
                    )}

                    {!eligibility.eligible && sub.status === 'revision_requested' && (
                        <Alert className="bg-red-50 border-red-100 rounded-2xl">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <AlertTitle className="text-xs font-black uppercase tracking-widest text-red-900">Window Expired</AlertTitle>
                            <AlertDescription className="text-sm text-red-700 font-bold">
                                {eligResponse.error || "Submission window (15 days) has expired."}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Sidebar (Right Col) */}
                <div className="space-y-8">
                    {/* File Links */}
                    <Card className="border-primary/10 shadow-xl shadow-primary/5">
                        <CardHeader className="bg-primary/5 border-b border-primary/5">
                            <CardTitle className="text-sm font-black text-primary uppercase tracking-widest">Submitted Files</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                            {sub.files.map((file: any) => (
                                <Link 
                                    key={file.id} 
                                    href={file.fileUrl} 
                                    target="_blank"
                                    className="flex items-center justify-between p-4 rounded-xl border border-primary/5 hover:bg-primary/5 hover:border-secondary transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/40 group-hover:text-secondary group-hover:bg-secondary/10 transition-all">
                                            <Download className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-primary/60 truncate max-w-[120px]">{file.originalName}</p>
                                            <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{file.fileType.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] border-primary/5 text-primary/40">{(file.fileSize / 1024 / 1024).toFixed(1)}MB</Badge>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Authors List */}
                    <Card className="border-primary/10 shadow-xl shadow-primary/5">
                        <CardHeader className="bg-primary/1 border-b border-primary/5">
                            <CardTitle className="text-sm font-black text-primary uppercase tracking-widest">Research Authors</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {sub.authors.map((author: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0 text-primary/40 font-black text-[10px]">
                                        {idx + 1}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-primary/80 leading-none">{author.name}</p>
                                        <p className="text-[10px] font-bold text-primary/30 tracking-tight leading-none">{author.institution}</p>
                                        {author.isCorresponding && (
                                            <Badge className="mt-2 bg-secondary/10 text-secondary border-0 text-[8px] font-black tracking-widest h-4 px-1.5 uppercase leading-none">Corresponding</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Published Link (if applicable) */}
                    {sub.publication && (
                        <Link 
                            href={sub.publication.finalPdfUrl}
                            target="_blank"
                            className="flex flex-col items-center justify-center gap-4 p-8 bg-primary rounded-3xl text-white text-center shadow-2xl shadow-primary/40 hover:scale-[1.02] transition-transform"
                        >
                            <Calendar className="w-12 h-12 text-secondary" />
                            <div className="space-y-1">
                                <h3 className="text-lg font-black tracking-tight">Paper Published!</h3>
                                <p className="text-xs text-white/60 font-black uppercase tracking-widest">
                                    Volume {sub.publication.volume}, Issue {sub.publication.issue}
                                </p>
                            </div>
                            <Badge className="bg-white/20 text-white border-0 text-[10px] tracking-widest font-black h-8 px-5 rounded-full backdrop-blur-sm">VIEW ARCHIVE</Badge>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
