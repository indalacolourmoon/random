import { getUserProfile } from "@/actions/users";
import ProfileForm from "@/features/shared/components/ProfileForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Account Profile | Editor Portal",
};

export default async function EditorProfilePage() {
    const user = await getUserProfile();

    if (!user) {
        redirect("/login");
    }

    return (
        <section className="space-y-12">
            <header className="space-y-4 border-b border-primary/5 pb-8">
                <div className="space-y-2">
                    <h1 className=" font-black text-primary tracking-widest uppercase leading-none">Identity Hub</h1>
                    <p className="text-xs sm:text-sm font-medium text-primary/40 border-l-2 border-primary/10 pl-4 transition-all duration-500">Manage your academic credentials, system signature, and authorization status.</p>
                </div>
            </header>

            <ProfileForm user={user} />
        </section>
    );
}
