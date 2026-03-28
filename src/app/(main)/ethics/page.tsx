import PageHeader from "@/components/layout/PageHeader";
import EthicsClient from '@/features/shared/components/EthicsClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Publication Ethics | ${settings.journal_name}`,
        description: `Our commitment to scientific integrity and scholarly standards. ${settings.journal_short_name} follows COPE guidelines to ensure ethical publishing and research excellence.`,
        alternates: {
            canonical: '/ethics',
        },
        openGraph: {
            title: `Integrity & Ethics - ${settings.journal_short_name}`,
            description: `Quality assurance benchmarks for international publishing.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function PublicationEthics() {
    const settings = await getSettings();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Publication Ethics"
                description="Our commitment to scientific integrity and scholarly standards."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication Ethics', href: '/ethics' },
                ]}
            />
            <EthicsClient settings={settings} />
        </main>
    );
}
