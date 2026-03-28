import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBar from "@/components/layout/TopBar";
import { getSettings } from "@/actions/settings";
import PromotionPopup from "@/features/home/components/PromotionPopup";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

import { ThemeProvider } from "@/providers/ThemeProvider";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getSettings();


    return (
        <ThemeProvider attribute="class" forcedTheme="light">
            <PromotionPopup settings={settings} />
            <TopBar settings={settings} />
            <Navbar settings={settings} />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer settings={settings} />
        </ThemeProvider>
    );
}
