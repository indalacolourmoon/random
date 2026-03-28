
import PageHeader from "@/components/layout/PageHeader";
import JoinUsClient from '@/features/shared/components/JoinUsClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Join Our Editorial Team | ${settings.journal_name}`,
        description: `Apply to become a reviewer or editor for ${settings.journal_short_name}. Join our global network of experts and contribute to engineering excellence through high-quality peer review.`,
        alternates: {
            canonical: '/join-us',
        },
        openGraph: {
            title: `Editorial Opportunity - ${settings.journal_short_name}`,
            description: `Contribute to the future of engineering discourse.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function JoinUsPage() {
    const settings = await getSettings();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Join Us"
                description="Contribute your expertise to the global scientific community and help shape the future of engineering."
                breadcrumbs={[
                    { name: "Home", href: "/" },
                    { name: "Join Us", href: "/join-us" }
                ]}
            />
            <JoinUsClient settings={settings} />
        </main>
    );
}
