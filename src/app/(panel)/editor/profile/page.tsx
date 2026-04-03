import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileDossier from "@/features/profile/components/ProfileDossier";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Editorial Board Profile | IJITEST",
};

export default async function EditorProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <section className="space-y-10">
            <header className="space-y-2 border-b border-white/5 pb-8">
                <h1 className="font-serif text-2xl xl:text-3xl 2xl:text-4xl font-semibold text-foreground tracking-tight capitalize leading-none">Editorial identity</h1>
                <p className="text-xs xl:text-sm font-semibold text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2 capitalize tracking-wide transition-all duration-500">Board metadata and system clearance vault.</p>
            </header>

            <Suspense fallback={
                <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                    <p className="text-[10px] font-semibold capitalize tracking-widest animate-pulse">Decrypting board credentials...</p>
                </div>
            }>
                <ProfileDossier role="editor" userId={(session.user as any).id} />
            </Suspense>
        </section>
    );
}
