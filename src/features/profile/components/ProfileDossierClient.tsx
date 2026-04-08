"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { 
    Building2, 
    Globe, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ExternalLink, 
    Camera,
    ChevronDown,
    FileText,
    Search,
    Plus,
    X,
    Lock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { InlineEditField } from "@/components/ui/InlineEditField"
import { DossierProgress } from "@/components/ui/DossierProgress"
import { toast } from "sonner"
import { 
    updateProfileField, 
    updateResearchInterests, 
    updateProfilePhoto,
    ProfileData 
} from "@/actions/profile"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProfileDossierClientProps {
    data: ProfileData
    role: 'admin' | 'editor' | 'reviewer' | 'author'
    userId: string
}

const CATEGORIES = [
    "AI/ML", "VLSI", "Renewable Energy", "Biomedical Engineering", 
    "Cybersecurity", "Data Science", "IoT", "Signal Processing", 
    "Environmental Engineering", "Civil Infrastructure"
]

export function ProfileDossierClient({ data: initialData, role, userId }: ProfileDossierClientProps) {
    const [data, setData] = useState<ProfileData>(initialData)
    const [isEditingInterests, setIsEditingInterests] = useState(false)
    const [newInterest, setNewInterest] = useState("")
    const [tempInterests, setTempInterests] = useState<string[]>(initialData.research_interests)
    const [isUploading, setIsUploading] = useState(false)

    // Refs for scrolling
    const sectionRefs = {
        'name': useRef<HTMLDivElement>(null),
        'designation': useRef<HTMLDivElement>(null),
        'orcid_id': useRef<HTMLDivElement>(null),
        'photo': useRef<HTMLDivElement>(null),
        'affiliation': useRef<HTMLDivElement>(null),
        'interests': useRef<HTMLDivElement>(null),
        'history': useRef<HTMLDivElement>(null)
    }

    const scrollToSection = (field: string) => {
        const refName = field.toLowerCase().replace(/\s+/g, '_')
        const ref = (sectionRefs as any)[refName]
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }

    const handleSaveField = async (field: string, value: string) => {
        try {
            const res = await updateProfileField(userId, field, value)
            if (!res.success) throw new Error(res.error || "Failed to update profile")
            setData(prev => ({ ...prev, [field === 'name' ? 'name' : field]: value }))
            toast.success(`Profile updated: ${field}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile")
            throw error
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await updateProfilePhoto(userId, formData)
            if (!response.success || !response.data) throw new Error(response.error || "Photo upload failed")
            setData(prev => ({ ...prev, photo_url: response.data || null }))
            toast.success("Profile photo updated")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Photo upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const toggleInterest = (interest: string) => {
        setTempInterests(prev => 
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        )
    }

    const addCustomInterest = () => {
        if (newInterest.trim() && !tempInterests.includes(newInterest.trim())) {
            setTempInterests(prev => [...prev, newInterest.trim()])
            setNewInterest("")
        }
    }

    const handleSaveInterests = async () => {
        try {
            const res = await updateResearchInterests(userId, tempInterests)
            if (!res.success || !res.data) throw new Error(res.error || "Failed to update interests")
            setData(prev => ({ ...prev, research_interests: res.data || [] }))
            setIsEditingInterests(false)
            toast.success("Interests updated")
        } catch (error) {
            toast.error("Failed to update interests")
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Simple Header */}
            <header className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative group/avatar" ref={sectionRefs['photo']}>
                    <div className="w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative border-2 border-slate-200 dark:border-slate-800">
                        {data.photo_url ? (
                            <Image 
                                src={data.photo_url} 
                                alt={data.name} 
                                fill
                                className="object-cover" 
                            />
                        ) : (
                            <div className="text-3xl font-bold text-slate-400">
                                {data.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white w-6 h-6" />
                            <input 
                                title="Upload Photo"
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={handlePhotoUpload}
                                accept="image/*"
                            />
                        </div>
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-lg">
                            <span className="animate-spin text-primary">...</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{data.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{data.designation || 'Academic Professional'}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                        <Badge variant="secondary" className="font-medium px-2 py-0.5">{role}</Badge>
                        {data.orcid_id && (
                            <Link 
                                href={`https://orcid.org/${data.orcid_id}`} 
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {data.orcid_id}
                            </Link>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-64 border-l border-slate-100 dark:border-slate-800 pl-0 md:pl-6">
                    <DossierProgress 
                        percentage={data.completeness.percentage}
                        missing={data.completeness.missing}
                        onChipClick={scrollToSection}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Details Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="p-5 pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div ref={sectionRefs['name']}>
                                <InlineEditField 
                                    label="Full Name" 
                                    value={data.name} 
                                    onSave={(v) => handleSaveField('name', v)}
                                    placeholder="Full Name" 
                                />
                            </div>
                            <div ref={sectionRefs['designation']}>
                                <InlineEditField 
                                    label="Designation" 
                                    value={data.designation} 
                                    onSave={(v) => handleSaveField('designation', v)}
                                    placeholder="e.g. Professor" 
                                />
                            </div>
                            <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                <label className="text-xs text-slate-400 flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" /> Email Address
                                </label>
                                <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-300">{data.email}</p>
                            </div>
                            <div ref={sectionRefs['orcid_id']}>
                                <InlineEditField 
                                    label="ORCID iD" 
                                    value={data.orcid_id || ""} 
                                    onSave={(v) => handleSaveField('orcid_id', v)}
                                    placeholder="0000-0000-0000-0000"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {role !== 'admin' && (
                        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="p-5 pb-2">
                                <CardTitle className="text-lg font-bold">Affiliation</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4" ref={sectionRefs['affiliation']}>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-400">Institution</span>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <Building2 className="w-4 h-4 opacity-50" />
                                        <p className="text-sm font-semibold">{data.application?.institute || 'Internal Account'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-400">Nationality</span>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <Globe className="w-4 h-4 opacity-50" />
                                        <p className="text-sm font-semibold">{data.application?.country || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Expertise Section */}
                    {(role === 'reviewer' || role === 'editor') && (
                        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm" ref={sectionRefs['interests']}>
                            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold">Research Interests</CardTitle>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                        setTempInterests([...data.research_interests]);
                                        setIsEditingInterests(!isEditingInterests);
                                    }}
                                    className="text-xs font-medium"
                                >
                                    {isEditingInterests ? "Cancel" : "Edit"}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-5">
                                <AnimatePresence mode="wait">
                                    {isEditingInterests ? (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                {CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => toggleInterest(cat)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                                            tempInterests.includes(cat) 
                                                                ? "bg-primary text-white" 
                                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                                                        )}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                <Input 
                                                    placeholder="Add other interest..." 
                                                    value={newInterest}
                                                    onChange={(e) => setNewInterest(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
                                                    className="h-10 text-sm"
                                                />
                                                <Button onClick={addCustomInterest} size="sm">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {tempInterests.filter(i => !CATEGORIES.includes(i)).map(interest => (
                                                    <Badge key={interest} variant="outline" className="gap-1 px-2 py-1">
                                                        {interest}
                                                        <X className="w-3 h-3 cursor-pointer" onClick={() => toggleInterest(interest)} />
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <Button size="sm" onClick={handleSaveInterests}>Save Changes</Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {data.research_interests.length > 0 ? data.research_interests.map(interest => (
                                                <span key={interest} className="px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-lg text-sm font-medium">
                                                    {interest}
                                                </span>
                                            )) : (
                                                <p className="text-slate-400 text-sm italic">No research interests listed.</p>
                                            )}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    )}

                    {/* Vetting Status */}
                    {role !== 'admin' && data.application && (
                        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-l-4 border-l-primary">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        data.application.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' :
                                        data.application.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600' :
                                        'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                                    )}>
                                        {data.application.status === 'approved' ? <CheckCircle2 className="w-6 h-6" /> : 
                                         data.application.status === 'rejected' ? <XCircle className="w-6 h-6" /> : 
                                         <Clock className="w-6 h-6" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            Status: {data.application.status}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                            {data.application.status === 'approved' ? `Your professional profile is active. You have access to all editorial modules.` :
                                             data.application.status === 'rejected' ? "After evaluation, the board has concluded to reject this application." :
                                             "Vetting protocols are currently analyzing your academic footprint."}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* History Section */}
                    {role !== 'admin' && role !== 'editor' && (
                        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm" ref={sectionRefs['history']}>
                            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold">
                                    {role === 'author' ? "Submissions" : "Reviews"}
                                </CardTitle>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                    <Link href={role === 'author' ? "/author/submissions" : "/reviewer/reviews"}>
                                        View All
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.history.length > 0 ? data.history.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-slate-300" />
                                                <div className="space-y-0.5">
                                                    <h5 className="text-sm font-semibold line-clamp-1 text-slate-700 dark:text-slate-300">{item.title}</h5>
                                                    <p className="text-[10px] text-slate-400">
                                                        {(item.created_at || item.updated_at) ? new Date((item.created_at || item.updated_at)!).toLocaleDateString() : 'Unknown Date'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-medium h-5 px-2">
                                                {item.status || item.decision || 'Completed'}
                                            </Badge>
                                        </div>
                                    )) : (
                                        <div className="py-8 text-center">
                                            <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            <p className="text-sm text-slate-400">No activity recorded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
