import PageHeader from "@/components/layout/PageHeader";
import { getLatestIssuePapers } from '@/actions/archives';
import ArchivesClient from '@/features/shared/components/ArchivesClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Current Issue | ${settings.journal_name}`,
        description: `Explore the latest research and technical papers published in the current issue of ${settings.journal_short_name}.`,
        openGraph: {
            title: `Current Issue - ${settings.journal_short_name}`,
            description: `Access the latest peer-reviewed technical manuscripts.`,
            type: 'website',
        }
    };
}

export default async function CurrentIssue() {
    const papers = await getLatestIssuePapers();
    const settings = await getSettings();

    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Current Issue"
                description="Latest research publications and technical papers."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication', href: '#' },
                    { name: 'Current Issue', href: '/current-issue' },
                ]}
                scrollOnComplete={true}
            />

            <ArchivesClient initialPapers={papers} settings={settings} mode="current" />
        </div>
    );
}
