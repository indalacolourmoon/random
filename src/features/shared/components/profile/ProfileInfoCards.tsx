"use client";

import React from 'react';
import { Shield, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { countries, getFlagUrl } from '@/lib/countries';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface InfoCardProps {
    fullName: string;
    designation?: string;
    institute?: string;
    phone?: string;
    nationality?: string;
}

export const ProfileInfoCards = React.memo(({
    fullName,
    designation,
    institute,
    phone,
    nationality
}: InfoCardProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black flex items-center gap-2 text-foreground dark:text-primary uppercase tracking-widest m-0">
                            <Shield className="w-5 h-5" /> Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                defaultValue={fullName}
                                required
                                className="bg-muted/50 border-border h-12 rounded-xl text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Designation</Label>
                            <Input
                                id="designation"
                                name="designation"
                                defaultValue={designation}
                                placeholder="e.g. Professor"
                                className="bg-muted/50 border-border h-12 rounded-xl text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nationality" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nationality</Label>
                            <Select name="nationality" defaultValue={nationality || "India"}>
                                <SelectTrigger id="nationality" className="bg-muted/50 border-border h-10">
                                    <SelectValue placeholder="Select Origin..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-80 rounded-xl border-border shadow-2xl">
                                    {countries.map(c => (
                                        <SelectItem key={c.code} value={c.name} className="py-2.5 focus:bg-primary/5 rounded-lg cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getFlagUrl(c.name)}
                                                    alt=""
                                                    className="w-5 h-3.5 object-cover rounded-sm shadow-sm border border-black/5"
                                                />
                                                <span className="font-bold text-foreground/80 uppercase tracking-widest text-[10px]">{c.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black flex items-center gap-2 text-foreground dark:text-primary uppercase tracking-widest m-0">
                            <Building2 className="w-5 h-5" /> Professional Affiliation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="institute" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Institution / University</Label>
                            <Input
                                id="institute"
                                name="institute"
                                defaultValue={institute}
                                placeholder="e.g. ABC University"
                                className="bg-muted/50 border-border h-12 rounded-xl text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Contact Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={phone}
                                placeholder="+1 (555) 000-0000"
                                className="bg-muted/50 border-border h-12 rounded-xl text-sm font-bold"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
});

ProfileInfoCards.displayName = 'ProfileInfoCards';
