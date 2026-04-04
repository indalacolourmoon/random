import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBar from "@/components/layout/TopBar";
import { getSettingsData } from '@/actions/settings';
import PromotionPopup from "@/features/home/components/PromotionPopup";


export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getSettingsData();


    return (
        <>
            <PromotionPopup settings={settings} />
            <TopBar settings={settings} />
            <Navbar settings={settings} />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer settings={settings} />
        </>
    );
}
