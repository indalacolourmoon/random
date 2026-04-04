import { ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditorialBoardClient from '@/features/shared/components/EditorialBoardClient';
import { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import { getEditorialBoard } from '@/actions/users';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Editorial Board | ${settings.journal_name}`,
        description: `Meet the esteemed editorial board of ${settings.journal_short_name}. Our panel of global academic experts is committed to scientific excellence and rigorous peer review in engineering and technology.`,
        alternates: {
            canonical: '/editorial-board',
        },
        openGraph: {
            title: `Editorial Board - ${settings.journal_short_name}`,
            description: `Global academic experts steering the ${settings.journal_name}.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function EditorialBoard() {
    const settings = await getSettingsData();
    const res = await getEditorialBoard();
    const initialMembers = res.success ? res.data || [] : [];

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Editorial Board"
                description="Our esteemed panel of global academic experts and researchers committed to scientific excellence."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Editorial Board', href: '/editorial-board' },
                ]}
                scrollOnComplete={true}
            />

            <section className="container-responsive py-10 sm:py-16 2xl:py-24 flex justify-center">
                <div className="space-y-20">
                    {/* Main Content */}
                    <EditorialBoardClient settings={settings} initialMembers={initialMembers} />

                    {/* Ethics Policy Banner */}
                    <Card className="bg-primary border-none text-white shadow-xl rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-colors duration-1000 pointer-events-none" />
                        <CardContent className="p-8 sm:p-12 relative z-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                                        <ShieldAlert className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl 2xl:text-4xl font-black text-white tracking-wider">Ethics Policy</CardTitle>
                                        <p className="text-sm 2xl:text-lg text-white/70 font-medium leading-relaxed max-w-xl 2xl:max-w-3xl">
                                            IJITEST follows COPE guidelines for scientific integrity and global best practices.
                                        </p>
                                    </div>
                                </div>
                                <Button asChild className="h-12 2xl:h-16 px-8 2xl:px-12 bg-white hover:bg-white/90 text-primary font-black text-xs 2xl:text-sm tracking-[0.2em] rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer">
                                    <Link href="/ethics" className="flex items-center cursor-pointer">
                                        View Policy <ChevronRight className="w-4 h-4 2xl:w-6 2xl:h-6 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
}

