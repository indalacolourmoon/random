import PageHeader from "@/components/layout/PageHeader";
import PeerReviewClient from '@/features/shared/components/PeerReviewClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Peer Review Process | ${settings.journal_name}`,
        description: `Explore the rigorous double-blind peer review process at ${settings.journal_short_name}. We ensure technical accuracy, originality, and scientific impact in all published research.`,
        alternates: {
            canonical: '/peer-review',
        },
        openGraph: {
            title: `Peer Review Excellence - ${settings.journal_short_name}`,
            description: `Quality assurance protocol for scientific manuscripts.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function PeerReview() {
    const settings = await getSettings();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Peer Review Process"
                description="Technical accuracy, originality, and scientific impact evaluation system."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Peer Review', href: '/peer-review' },
                ]}
            />
            <PeerReviewClient settings={settings} />
        </main>
    );
}
