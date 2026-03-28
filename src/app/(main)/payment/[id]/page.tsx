import PaymentClient from '@/features/shared/components/PaymentClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Manuscript Grant | ${settings.journal_short_name}`,
        description: `Secure payment gateway for manuscript publication at ${settings.journal_name}. Standardized IEEE Article Processing Fees (APC) and SJIF impact evaluation grants.`,
        robots: 'noindex, nofollow', // Payment pages should usually not be indexed
    };
}

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const settings = await getSettings();

    return <PaymentClient id={id} settings={settings} />;
}
