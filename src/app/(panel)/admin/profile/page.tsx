import { getUserProfile } from "@/actions/users";
import ProfileForm from "@/features/shared/components/ProfileForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Account Profile | Admin Panel",
};

export default async function AdminProfilePage() {
    const user = await getUserProfile();

    if (!user) {
        redirect("/login");
    }

    return (
        <section className="space-y-10">
            <header className="space-y-2 border-b border-primary/5 pb-6">
                <h1 className=" font-black text-foreground tracking-widest uppercase leading-none">Personal Identity</h1>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground border-l-2 border-primary/10 pl-4">Manage your professional information and administrative credentials.</p>
            </header>

            <ProfileForm user={user} />
        </section>
    );
}
