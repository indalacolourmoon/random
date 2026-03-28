import { getSettings } from "@/actions/settings";
import GuidelinesContent from "./GuidelinesContent";
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Author Guidelines | ${settings.journal_name}`,
        description: `Comprehensive protocol for submitting manuscripts to ${settings.journal_short_name}. Detailed instructions on formatting, templates, and ethical requirements for global research publication.`,
        openGraph: {
            title: `Submission Protocol - ${settings.journal_short_name}`,
            description: `Author resources and manuscript formatting templates.`,
            type: 'website',
        }
    };
}

export default async function AuthorGuidelines() {
    const settings = await getSettings();

    return <GuidelinesContent settings={settings} />;
}
