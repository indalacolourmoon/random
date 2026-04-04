import { getProfileData } from "@/actions/profile"
import { ProfileDossierClient } from "./ProfileDossierClient"

export default async function ProfileDossier({ role, userId }: { role: any, userId: string }) {
    const profileResponse = await getProfileData(userId, role)
    if (!profileResponse.success || !profileResponse.data) {
        return <div>Error loading profile data: {profileResponse.error || "Data not found"}</div>
    }
    
    return <ProfileDossierClient data={profileResponse.data} role={role} userId={userId} />
}
