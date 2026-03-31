import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileDossier from "@/features/profile/components/ProfileDossier";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Account Profile | Admin Panel",
};

export default async function AdminProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <section className="space-y-10">
            <header className="space-y-2 border-b border-white/5 pb-8">
                <h1 className="font-serif text-3xl font-black text-foreground tracking-tight uppercase leading-none">Administrative Identity</h1>
                <p className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest opacity-60">Manage your core credentials and architectural clearance.</p>
            </header>

            <Suspense fallback={
                <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                    <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Initializing Identity Dossier...</p>
                </div>
            }>
                <ProfileDossier role="admin" userId={parseInt((session.user as any).id)} />
            </Suspense>
        </section>
    );
}
