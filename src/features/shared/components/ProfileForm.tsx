"use client";

import { useState, useRef } from 'react';
import { updateUserProfile } from '@/actions/users';

// Import sub-components
import { ProfileHeader } from './profile/ProfileHeader';
import { ProfileInfoCards } from './profile/ProfileInfoCards';
import { ExpertiseDossier } from './profile/ExpertiseDossier';
import { ProfileFormActions } from './profile/ProfileFormActions';

interface ProfileFormProps {
    user: {
        id: number;
        email: string;
        full_name: string;
        designation?: string;
        institute?: string;
        phone?: string;
        bio?: string;
        photo_url?: string;
        role: string;
        nationality?: string;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleAction(formData: FormData) {
        setIsSubmitting(true);
        setStatus(null);

        try {
            const result = await updateUserProfile(formData);
            if (result.success) {
                setStatus({ success: true });
                setTimeout(() => setStatus(null), 5000);
            } else {
                setStatus({ error: result.error });
            }
        } catch (error) {
            setStatus({ error: "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <form action={handleAction} className="space-y-12">
                {/* 1. Header & Photo Area */}
                <ProfileHeader
                    fullName={user.full_name}
                    email={user.email}
                    role={user.role}
                    photoUrl={user.photo_url}
                    previewUrl={previewUrl}
                    onPhotoClick={() => fileInputRef.current?.click()}
                />

                {/* Hidden File Input */}
                <input
                    id="profile-photo-input"
                    type="file"
                    name="photo"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    aria-label="Upload profile photo"
                    title="Choose a profile photo"
                />
                <input type="hidden" name="existingPhotoUrl" value={user.photo_url || ''} title="Existing Photo URL" />

                {/* 2. Professional Details & Institution */}
                <ProfileInfoCards
                    fullName={user.full_name}
                    designation={user.designation}
                    institute={user.institute}
                    phone={user.phone}
                    nationality={user.nationality}
                />

                {/* 3. Expertise Dossier */}
                <ExpertiseDossier bio={user.bio} />

                {/* 4. Feedback & Actions */}
                <ProfileFormActions
                    isSubmitting={isSubmitting}
                    status={status}
                />
            </form>
        </div>
    );
}
