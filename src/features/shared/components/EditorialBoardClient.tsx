'use client';

import { Variants } from 'framer-motion';
import { Mail, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useEditorialBoard } from '@/hooks/queries/usePublic';
import { staticEditorialBoardMembers, BoardMember } from '../data/editorial-board';
import { UserWithProfile } from '@/db/types';

interface EditorialBoardClientProps {
    settings: Record<string, string>;
    initialMembers: UserWithProfile[];
}

export default function EditorialBoardClient({ settings, initialMembers }: EditorialBoardClientProps) {
    const { data: dynamicMembers = [], isLoading } = useEditorialBoard(initialMembers);
    const supportEmail = settings.support_email || "editor@iitest.org";
    
    const groupedBoard = useMemo(() => {
        // Map dynamic members to match the display loop
        const mappedDynamic = dynamicMembers.map(m => ({
            full_name: m.profile?.fullName || "Staff",
            designation: m.profile?.designation || "Editor",
            institute: m.profile?.institute || "IJITEST",
            nationality: m.profile?.nationality || "",
            email: m.email,
            role: m.role
        }));

        const board = [
            {
                role: "Editor-in-Chief",
                members: mappedDynamic.filter(m => m.role === 'admin')
            },
            {
                role: "Editorial Board Members",
                members: staticEditorialBoardMembers
            },
        ];
        return board.filter(category => category.members.length > 0);
    }, [dynamicMembers]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as const
            }
        }
    };

    if (isLoading && dynamicMembers.length === 0) {
        return (
            <div className="p-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/10" />
            </div>
        );
    }

    return (
        <section className=" space-y-12 max-w-5xl 2xl:container-responsive">
            {/* Board Sections */}
            {groupedBoard.map((category, idx) => (
                <section key={idx} className="overflow-hidden rounded-xl border border-primary/10 shadow-sm">
                    {/* Role Header */}
                    <div className="bg-[#4a154b] p-3 px-6 2xl:p-8 2xl:px-14">
                        <h2 className="text-white m-0 font-bold text-lg 2xl:text-2xl tracking-tight">
                            {category.role}
                        </h2>
                    </div>

                    <div className="divide-y divide-primary/5">
                        {category.members.map((member: BoardMember, mIdx: number) => (
                            <article key={mIdx} className="group">
                                {/* Name Row */}
                                <header className="bg-[#f0f9ff] py-3 px-6 2xl:py-8 2xl:px-14 flex items-center gap-3">
                                    <h3 className="text-[#2563eb] m-0 font-bold text-base 2xl:text-xl">
                                        {member.full_name}
                                    </h3>
                                </header>

                                {/* Institution & Details Row */}
                                <div className="bg-[#f8fafc] py-4 px-6 2xl:py-10 2xl:px-14 space-y-2 2xl:space-y-6">
                                    <div className="flex gap-3 text-slate-600 font-medium text-xs sm:text-sm lg:text-base 2xl:text-lg">
                                        <p className="m-0">
                                            {member.designation}. {member.institute}
                                            {member.nationality && member.institute.toLowerCase().indexOf(member.nationality.toLowerCase()) === -1 
                                                ? `. ${member.nationality}` 
                                                : ""
                                            }
                                        </p>
                                    </div>
                                    {member.email && (idx === 0 || member.role === 'admin') && (
                                        <div className="flex gap-3 text-primary/60 font-medium text-sm">
                                            <Mail className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                                            <a href={`mailto:${member.email}`} className="hover:text-secondary hover:underline transition-colors truncate">
                                                {member.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ))}

            {/* Support/Contact Footer */}
            <section className="pt-12 border-t border-primary/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-10">
                    <div>
                        <h3 className="text-primary mb-2 m-0 font-bold text-lg 2xl:text-2xl">Editorial Support</h3>
                        <p className="text-primary/50 font-medium m-0 text-sm">For inquiries related to editor roles or board selection.</p>
                    </div>
                    <a
                        href={`mailto:${supportEmail}`}
                        className="text-secondary hover:text-primary transition-colors border-b-2 border-secondary/20 hover:border-primary pb-1 font-bold text-lg lg:text-2xl"
                    >
                        {supportEmail}
                    </a>
                </div>
            </section>
        </section>
    );
}
