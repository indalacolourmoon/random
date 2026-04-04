import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkResubmissionEligibility, getAuthorSubmission } from "@/actions/author-submissions";
import { ResubmitForm } from "@/components/forms/ResubmitForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ResubmitPage({ params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    if (session.user.role !== 'author') redirect(`/${session.user.role}`);

    const submissionId = parseInt(params.id);
    if (isNaN(submissionId)) notFound();

    const [submissionRes, eligibilityRes] = await Promise.all([
        getAuthorSubmission(submissionId),
        checkResubmissionEligibility(submissionId),
    ]);

    if (!submissionRes.success || !submissionRes.data) notFound();
    const submission = submissionRes.data;
    const eligibility = eligibilityRes.data || { eligible: false, daysRemaining: 0 };

    return (
        <section className="max-w-2xl mx-auto space-y-6 pb-20">
            <header className="flex items-center gap-4 border-b border-primary/5 pb-6">
                <Button asChild variant="ghost" size="sm" className="rounded-lg">
                    <Link href={`/author/submissions/${submissionId}`} className="flex items-center gap-2 text-xs font-bold uppercase">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </Link>
                </Button>
                <div>
                    <h1 className="font-black text-foreground tracking-widest uppercase text-xl">Submit Revision</h1>
                    <p className="text-xs text-muted-foreground font-medium">Upload your revised manuscript and copyright form</p>
                </div>
            </header>

            {!eligibility.eligible ? (
                <Card className="border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5">
                    <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
                        <XCircle className="w-12 h-12 text-rose-500" />
                        <h3 className="font-black text-xl uppercase tracking-widest text-foreground">Not Eligible</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">{eligibilityRes.error || "Window Expired"}</p>
                        <Button asChild variant="outline" size="sm" className="rounded-xl font-bold uppercase text-xs">
                            <Link href="/author">Back to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <ResubmitForm
                    submissionId={submissionId}
                    paperId={submission.paperId}
                    title={submission.title}
                    daysRemaining={eligibility.daysRemaining || 0}
                    currentStatus={submission.status}
                />
            )}
        </section>
    );
}
