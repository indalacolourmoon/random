import PageHeader from "@/components/layout/PageHeader";
import { getArchivePapers } from '@/actions/archives';
import ArchivesClient from '@/features/shared/components/ArchivesClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Journal Archives | ${settings.journal_name}`,
        description: `Browse the digital repository of ${settings.journal_short_name}. Explore peer-reviewed research, technical reports, and innovative trends in engineering and science since ${settings.journal_name}'s inception.`,
        openGraph: {
            title: `Research repository - ${settings.journal_short_name}`,
            description: `Global access to peer-reviewed technical manuscripts.`,
            type: 'website',
        }
    };
}

export default async function Archives() {
    const papers = await getArchivePapers();
    const settings = await getSettings();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Journal Archives"
                description="Digital repository of peer-reviewed research and technical reports."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication', href: '#' },
                    { name: 'Archives', href: '/archives' },
                ]}
                scrollOnComplete={true}
            />

            <ArchivesClient initialPapers={papers} settings={settings} mode="archive" />
        </main>
    );
}
