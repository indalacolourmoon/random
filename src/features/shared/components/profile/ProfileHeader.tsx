"use client";

import React from 'react';
import Image from 'next/image';
import { Camera, User, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
    fullName: string;
    email: string;
    role: string;
    photoUrl?: string;
    previewUrl: string | null;
    onPhotoClick: () => void;
}

export const ProfileHeader = React.memo(({
    fullName,
    email,
    role,
    photoUrl,
    previewUrl,
    onPhotoClick
}: ProfileHeaderProps) => {
    return (
        <div className="bg-card border border-border/50 shadow-sm rounded-xl p-8 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                {/* Photo Upload Area */}
                <div className="relative group/photo">
                    <div className="w-32 h-32 rounded-xl bg-muted border border-border/50 overflow-hidden flex items-center justify-center transition-all relative">
                        {previewUrl || photoUrl ? (
                            <Image
                                src={previewUrl || photoUrl || ''}
                                alt="Profile"
                                fill
                                className="object-cover transition-transform duration-500"
                                unoptimized={!!previewUrl}
                            />
                        ) : (
                            <User className="w-12 h-12 text-muted-foreground/30" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={onPhotoClick}
                        className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl shadow-md border-4 border-card bg-[#000066] text-white hover:bg-[#000088] transition-all z-20"
                        aria-label="Change profile photo"
                        title="Change profile photo"
                    >
                        <Camera className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-gray-900 leading-none m-0">{fullName}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <Badge variant="secondary" className="px-3 h-6 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#000066]/5 text-[#000066] border-[#000066]/10">
                                {role}
                            </Badge>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">
                                <Mail className="w-3.5 h-3.5" />
                                {email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

ProfileHeader.displayName = 'ProfileHeader';
