'use client';

import { Variants } from 'framer-motion';
import { Mail, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useEditorialBoard } from '@/hooks/queries/usePublic';
import { staticEditorialBoardMembers, BoardMember } from '../data/editorial-board';
import { SafeUserWithProfile } from '@/db/types';

interface EditorialBoardClientProps {
    settings: Record<string, string>;
    initialMembers: SafeUserWithProfile[];
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
                    <div className="bg-[#000066] p-4 px-6 xl:px-8">
                        <h2 className="text-white m-0 font-serif font-semibold text-lg xl:text-xl 2xl:text-2xl">
                            {category.role}
                        </h2>
                    </div>

                    <div className="divide-y divide-primary/5">
                        {category.members.map((member: BoardMember, mIdx: number) => (
                            <article key={mIdx} className="group">
                                {/* Name Row */}
                                <header className="bg-muted/30 py-3 px-6 xl:px-8 border-b border-border/50">
                                    <h3 className="text-primary m-0 font-semibold text-sm xl:text-base 2xl:text-lg">
                                        {member.full_name}
                                    </h3>
                                </header>

                                {/* Institution & Details Row */}
                                <div className="bg-card py-4 px-6 xl:px-8 space-y-2">
                                    <div className="flex gap-3 text-muted-foreground text-xs xl:text-sm">
                                        <p className="m-0 leading-relaxed">
                                            <span className="font-medium text-foreground">{member.designation}</span> • {member.institute}
                                            {member.nationality && member.institute.toLowerCase().indexOf(member.nationality.toLowerCase()) === -1 
                                                ? ` • ${member.nationality}` 
                                                : ""
                                            }
                                        </p>
                                    </div>
                                    {member.email && (idx === 0 || member.role === 'admin') && (
                                        <div className="flex items-center gap-2 text-xs text-primary/70">
                                            <Mail className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                                            <a href={`mailto:${member.email}`} className="hover:text-primary hover:underline transition-colors truncate">
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
            <section className="pt-8 border-t border-border/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8">
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-primary mb-1">Editorial Support</h3>
                        <p className="text-xs text-muted-foreground">For inquiries related to editor roles or board selection.</p>
                    </div>
                    <a
                        href={`mailto:${supportEmail}`}
                        className="text-primary font-semibold text-lg xl:text-xl border-b border-primary/20 hover:border-primary transition-all pb-0.5"
                    >
                        {supportEmail}
                    </a>
                </div>
            </section>
        </section>
    );
}
