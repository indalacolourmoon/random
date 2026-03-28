import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        const role = (session.user as any)?.role || 'reviewer';
        redirect(`/${role}`);
    }

    return <LoginClient />;
}
