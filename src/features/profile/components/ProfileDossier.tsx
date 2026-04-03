import { getProfileData } from "@/actions/profile"
import { ProfileDossierClient } from "./ProfileDossierClient"

export default async function ProfileDossier({ role, userId }: { role: any, userId: number }) {
    const profileData = await getProfileData(userId, role)
    
    return <ProfileDossierClient data={profileData} role={role} userId={userId} />
}
