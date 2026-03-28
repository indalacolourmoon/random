import { getUserProfile } from "@/actions/users";
import ProfileForm from "@/features/shared/components/ProfileForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Account Profile | Reviewer Portal",
};

export default async function ReviewerProfilePage() {
    const user = await getUserProfile();

    if (!user) {
        redirect("/login");
    }

    return (
        <section className="space-y-10 pb-20">
            <header className="space-y-2 border-b border-primary/5 pb-8">
                <h1 className=" font-black text-foreground tracking-widest uppercase leading-none">Technical Identity</h1>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2 transition-all duration-500">Ensure your expertise and research interests are current for better review assignments.</p>
            </header>

            <ProfileForm user={user} />
        </section>
    );
}
