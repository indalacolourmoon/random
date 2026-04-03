import { Suspense } from "react";
import { ManageMessagesContent } from "@/features/messages/components/ManageMessagesContent";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Intelligence Inbox | IJITEST Administrative Board",
    description: "Secure gateway for institutional inquiries and researcher communications."
};

export default function MessagesPage() {
    return (
        <section className="h-[calc(100vh-140px)] flex flex-col gap-8 p-0">
            <header className="flex flex-col gap-1 px-8 py-2 shrink-0 border-l-2 border-primary/20">
                <h1 className="font-serif text-2xl xl:text-3xl 2xl:text-4xl font-semibold tracking-tight leading-none capitalize">Communications hub</h1>
                <p className="text-[9px] xl:text-xs 2xl:text-sm font-medium capitalize tracking-widest text-muted-foreground opacity-40">Decrypting incoming intelligence streams</p>
            </header>

            <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-40">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Initializing Comm-Matrix...</p>
                </div>
            }>
                <div className="flex-1 min-h-0 px-8 pb-8 overflow-hidden">
                    <ManageMessagesContent />
                </div>
            </Suspense>
        </section>
    );
}
