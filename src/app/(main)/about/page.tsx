import { ChevronRight } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AboutClient from '@/features/shared/components/AboutClient';
import { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `About the Journal | ${settings.journal_name}`,
        description: `Learn about ${settings.journal_name} (${settings.journal_short_name}). We focus on rapid yet rigorous peer review for technically sound research in engineering, science, and technology.`,
        alternates: {
            canonical: '/about',
        },
        openGraph: {
            title: `About ${settings.journal_short_name}`,
            description: `Quality academic publishing for the modern era.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function About() {
    const settings = await getSettingsData();

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="About the Journal"
                description="Rapid yet rigorous peer review for technically sound research in engineering, science, and technology."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'About', href: '/about' },
                ]}
                scrollOnComplete={true}
            />

            <Section>
                <SidebarLayout
                    sidebar={
                        <>
                            <div className="p-1 rounded-[2.5rem] bg-linear-to-br from-primary/10 to-transparent border border-primary/5 shadow-vip animate-float">
                                <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.3rem]">
                                    <TrackManuscriptWidget />
                                </div>
                            </div>

                            <Card className="bg-white border-none text-primary shadow-vip-hover rounded-lg overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl animate-blob pointer-events-none" />
                                <CardContent className="px-8 mt-2 relative z-10">

                                    <CardTitle className="mb-2 text-primary">Ethics Policy</CardTitle>
                                    <p className="opacity-70 mb-2 leading-relaxed ">IJITEST follows COPE guidelines for scientific integrity and global best practices.</p>
                                    <Link href="/ethics" className="group/link inline-flex items-center gap-2 text-primary cursor-pointer">
                                        <span className="border-b border-white/30 group-hover/link:border-white transition-all pb-1">View Policy</span>
                                        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border border-primary/5 shadow-vip rounded-lg group overflow-hidden relative">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-y-1/2 translate-x-1/2 blur-2xl animate-blob pointer-events-none delay-1000" />
                                <CardContent className="px-8 relative z-10">
                                    <h2 className="text-primary mb-2">Call for Papers</h2>
                                    <p className="opacity-50 mb-8 leading-relaxed">Submit your breakthrough research for our upcoming 2026 Monthly edition.</p>
                                    <div className="animate-float">
                                        <Button asChild className="w-full h-14 2xl:h-20 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-2xl group/btn transition-all duration-500 overflow-hidden relative cursor-pointer">
                                            <Link href="/submit" className="flex items-center justify-center relative z-10 cursor-pointer">
                                                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shine" />
                                                <span className="relative z-10">Submit Manuscript</span>
                                                <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform relative z-10" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    }
                >
                    <AboutClient settings={settings} />
                </SidebarLayout>
            </Section>
        </main>
    );
}
