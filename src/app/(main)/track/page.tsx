import PageHeader from "@/components/layout/PageHeader";
import TrackClient from '@/features/shared/components/TrackClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Track Your Manuscript | ${settings.journal_name}`,
        description: `Check the real-time status of your research submission at ${settings.journal_short_name}. Transparent tracking of editorial screening, peer review, and publication journey.`,
        alternates: {
            canonical: '/track',
        },
        openGraph: {
            title: `Submission Tracking - ${settings.journal_short_name}`,
            description: `Real-time transparency for research submissions.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function TrackManuscript() {
    const settings = await getSettings();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Track Manuscript"
                description="Real-time transparency for your research submission."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Track', href: '/track' },
                ]}
            />

            <Suspense fallback={
                <section className="min-h-[50vh] bg-background flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </section>
            }>
                <TrackClient settings={settings} />
            </Suspense>
        </main>
    );
}
