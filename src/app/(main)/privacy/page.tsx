import PageHeader from "@/components/layout/PageHeader";
import PrivacyClient from '@/features/shared/components/PrivacyClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Privacy Policy | ${settings.journal_name}`,
        description: `Learn how ${settings.journal_short_name} protects your personal data and scholarly contributions. Our privacy protocols ensure a secure and confidential research environment.`,
        alternates: {
            canonical: '/privacy',
        },
        openGraph: {
            title: `Data Protection - ${settings.journal_short_name}`,
            description: `Scholarly data privacy and security benchmarks.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function PrivacyPolicy() {
    const settings = await getSettings();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Privacy Policy"
                description="Safeguarding personal data and scholarly contributions."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Privacy Policy', href: '/privacy' },
                ]}
            />
            <PrivacyClient settings={settings} />
        </main>
    );
}
