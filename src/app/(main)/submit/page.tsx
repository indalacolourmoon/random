import PageHeader from "@/components/layout/PageHeader";
import SubmitClient from '@/features/shared/components/SubmitClient';
import { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Submit Manuscript | ${settings.journal_name}`,
        description: `Submit your original research technical papers to ${settings.journal_short_name} for high-impact peer review and fast-track publication.`,
        alternates: {
            canonical: '/submit',
        },
        openGraph: {
            title: `Manuscript Submission - ${settings.journal_short_name}`,
            description: `Global call for papers in Engineering and Technology.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function SubmitPaper() {
    const settings = await getSettingsData();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Manuscript Submission"
                description="Submit your technical research for peer review and global indexing."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Submit Paper', href: '/submit' },
                ]}
            />
            <SubmitClient settings={settings} />
        </main>
    );
}

