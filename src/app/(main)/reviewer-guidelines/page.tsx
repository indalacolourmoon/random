import PageHeader from "@/components/layout/PageHeader";
import ReviewerGuidelinesClient from '@/features/shared/components/ReviewerGuidelinesClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Reviewer Guidelines | ${settings.journal_name}`,
        description: `Elite protocols and ethical standards for manuscript evaluation at ${settings.journal_short_name}. Detailed directives on methodology, originality, and confidentiality for domain experts.`,
        alternates: {
            canonical: '/reviewer-guidelines',
        },
        openGraph: {
            title: `Technical Evaluation Protocols - ${settings.journal_short_name}`,
            description: `Expert standards for technical evaluation.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function ReviewerGuidelines() {
    const settings = await getSettings();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Reviewer Guidelines"
                description="Expert standards and ethical responsibilities for technical evaluation."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Reviewer Guidelines', href: '/reviewer-guidelines' },
                ]}
            />
            <ReviewerGuidelinesClient settings={settings} />
        </main>
    );
}


