"use client"

import { useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    User, 
    Building2, 
    Globe, 
    Mail, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ExternalLink, 
    Camera, 
    Upload,
    ChevronDown,
    FileText,
    History,
    Search,
    Plus,
    X,
    Lock,
    Edit2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProfileDossierClientProps {
    data: ProfileData
    role: 'admin' | 'editor' | 'reviewer' | 'author'
    userId: number
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
        'Full Name': useRef<HTMLDivElement>(null),
        'Designation': useRef<HTMLDivElement>(null),
        'ORCID ID': useRef<HTMLDivElement>(null),
        'Profile Photo': useRef<HTMLDivElement>(null),
        'Academic Institute': useRef<HTMLDivElement>(null),
        'Nationality/Country': useRef<HTMLDivElement>(null),
        'Research Interests': useRef<HTMLDivElement>(null),
        'Submission History': useRef<HTMLDivElement>(null),
        'Activity History': useRef<HTMLDivElement>(null)
    }

    const scrollToSection = (field: string) => {
        const ref = (sectionRefs as any)[field]
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }

    const handleSaveField = async (field: string, value: string) => {
        try {
            await updateProfileField(userId, field, value)
            setData(prev => ({ ...prev, [field === 'name' ? 'name' : field]: value }))
            toast.success(`Identity updated: ${field}`)
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile")
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
            const newUrl = await updateProfilePhoto(userId, formData)
            setData(prev => ({ ...prev, photo_url: newUrl }))
            toast.success("Identity photo updated")
        } catch (error: any) {
            toast.error(error.message || "Photo upload failed")
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
            const saved = await updateResearchInterests(userId, tempInterests)
            setData(prev => ({ ...prev, research_interests: saved }))
            setIsEditingInterests(false)
            toast.success("Research profile updated")
        } catch (error: any) {
            toast.error("Failed to update interests")
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24">
            {/* Header/Completeness */}
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-8 2xl:p-12 rounded-[2.5rem] 2xl:rounded-[4rem] shadow-2xl">
                <DossierProgress 
                    percentage={data.completeness.percentage}
                    missing={data.completeness.missing}
                    onChipClick={scrollToSection}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] 2xl:grid-cols-[500px_1fr] gap-8 2xl:gap-14 items-start">
                
                {/* Left Column: Identity Sidebar */}
                <aside className="lg:sticky lg:top-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                    <Card className="bg-white/[0.02] border-white/5 shadow-2xl rounded-[2.5rem] 2xl:rounded-[3.5rem] overflow-hidden">
                        <CardContent className="p-10 2xl:p-14 text-center space-y-8">
                            {/* Photo */}
                            <div className="flex justify-center" ref={sectionRefs['Profile Photo']}>
                                <div className="relative group/avatar">
                                    <div className="w-40 h-40 2xl:w-60 2xl:h-60 rounded-full border-4 border-primary/20 p-2 shadow-2xl ring-1 ring-white/10">
                                        <div className="w-full h-full rounded-full bg-muted overflow-hidden flex items-center justify-center relative">
                                            {data.photo_url ? (
                                                <img 
                                                    src={data.photo_url} 
                                                    alt={data.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" 
                                                />
                                            ) : (
                                                <div className="font-serif text-5xl font-black text-primary/40 uppercase">
                                                    {data.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                            )}
                                            
                                            {/* Upload Overlay */}
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer">
                                                {isUploading ? (
                                                    <span className="animate-spin text-white">/</span>
                                                ) : (
                                                    <>
                                                        <Camera className="text-white w-6 h-6" />
                                                        <span className="text-white text-[9px] font-black uppercase tracking-widest">Update Identity</span>
                                                    </>
                                                )}
                                                <input 
                                                    title="user photo upload"
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    onChange={handlePhotoUpload}
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {data.photo_url && (
                                        <div className="absolute -bottom-2 right-4 bg-emerald-600 p-2.5 rounded-2xl shadow-xl shadow-emerald-500/30 border-2 border-background">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div ref={sectionRefs['Full Name']}>
                                    <InlineEditField 
                                        label="Full Name" 
                                        value={data.name} 
                                        onSave={(v) => handleSaveField('name', v)}
                                        placeholder="Full academic name" 
                                    />
                                </div>
                                <div ref={sectionRefs['Designation']}>
                                    <InlineEditField 
                                        label="Designation" 
                                        value={data.designation} 
                                        onSave={(v) => handleSaveField('designation', v)}
                                        placeholder="e.g. Professor, Scientist" 
                                    />
                                </div>
                                
                                <div className="space-y-1.5 py-4 px-4 bg-muted/20 rounded-3xl border border-white/5 text-left group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 px-1">
                                        <Lock className="w-2.5 h-2.5" /> Email Address
                                    </label>
                                    <div className="flex items-center justify-between">
                                        <span className="font-serif text-lg font-bold truncate opacity-80 pl-1">{data.email}</span>
                                        <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] font-black uppercase bg-muted px-2 py-1 rounded text-muted-foreground">Encrypted</span>
                                        </div>
                                    </div>
                                </div>

                                <div ref={sectionRefs['ORCID ID']}>
                                    <InlineEditField 
                                        label="ORCID iD" 
                                        value={data.orcid_id || ""} 
                                        onSave={(v) => handleSaveField('orcid_id', v)}
                                        placeholder="0000-0000-0000-0000"
                                        icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.541 0 .981.44.981.981 0 .542-.44.981-.981.981-.541 0-.98-.439-.98-.981 0-.541.439-.981.98-.981zm1.49 13.918H7.369V8.044h1.49v10.252zm-1.49-11.417c.541 0 .981.44.981.981 0 .541-.44.981-.981.981-.541 0-.98-.44-.98-.981 0-.541.439-.981.98-.981zM11.531 18.296h-1.49V8.044h1.49v1.205c.294-.482.793-1.353 2.164-1.353 2.21 0 3.333 1.554 3.333 3.654 0 2.824-1.503 4.887-3.693 4.887-1.49 0-2.029-.981-2.164-1.353v3.213zm3.178-3.08c1.336 0 2.128-1.018 2.128-2.671 0-1.637-.735-2.61-2.029-2.61-1.31 0-2.14 1.018-2.14 2.656 0 1.637.787 2.625 2.041 2.625z"/></svg>}
                                    />
                                    {data.orcid_id && (
                                        <a 
                                            href={`https://orcid.org/${data.orcid_id}`} 
                                            target="_blank" 
                                            className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-[#a6ce39]/10 text-[#a6ce39] rounded-full text-[10px] font-black uppercase hover:bg-[#a6ce39]/20 transition-all border border-[#a6ce39]/20"
                                        >
                                            View ORCID Registry <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Right Column: Sections */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Affiliation Section */}
                    {role !== 'admin' && (
                        <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] 2xl:rounded-[3.5rem]">
                            <CardContent className="p-10 2xl:p-14">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <h3 className="font-serif text-2xl 2xl:text-3xl font-black text-foreground">Academic Affiliation</h3>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-40">Verified via application audit</p>
                                    </div>
                                    <Badge variant="outline" className="h-8 px-4 border-white/10 text-[9px] font-black opacity-40 uppercase">Read-Only Repository</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 2xl:gap-14">
                                    <div className="space-y-2 p-6 bg-muted/10 rounded-3xl border border-white/5" ref={sectionRefs['Academic Institute']}>
                                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Institution</span>
                                        <div className="flex items-center gap-4 text-foreground">
                                            <Building2 className="w-5 h-5 opacity-40" />
                                            <p className="font-serif text-lg 2xl:text-2xl font-bold">{data.application?.institute || 'Internal Admin'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 p-6 bg-muted/10 rounded-3xl border border-white/5" ref={sectionRefs['Nationality/Country']}>
                                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Nationality / Locale</span>
                                        <div className="flex items-center gap-4 text-foreground">
                                            <Globe className="w-5 h-5 opacity-40" />
                                            <p className="font-serif text-lg 2xl:text-2xl font-bold">{data.application?.country || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-6 text-[9px] text-muted-foreground font-medium uppercase tracking-tight opacity-30 italic">
                                    * These credentials were verified during vetting. To update institute details, please initiate the re-evaluation protocol with the editorial board.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Research Domains Section */}
                    {(role === 'reviewer' || role === 'editor') && (
                        <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] 2xl:rounded-[3.5rem]" ref={sectionRefs['Research Interests']}>
                            <CardContent className="p-10 2xl:p-14">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <h3 className="font-serif text-2xl 2xl:text-3xl font-black text-foreground">Specialist Expertise</h3>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-40">Dynamic Domain Repository</p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => {
                                            setTempInterests([...data.research_interests]);
                                            setIsEditingInterests(!isEditingInterests);
                                        }}
                                        className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5"
                                    >
                                        {isEditingInterests ? "Cancel Changes" : "Refactor Domains"}
                                    </Button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isEditingInterests ? (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-8"
                                        >
                                            <div className="space-y-4">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Standard Categories</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {CATEGORIES.map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => toggleInterest(cat)}
                                                            className={cn(
                                                                "h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                tempInterests.includes(cat) 
                                                                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                                                                    : "bg-muted/30 text-muted-foreground border border-white/5 hover:border-primary/40"
                                                            )}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Custom Identifiers</span>
                                                <div className="flex gap-4">
                                                    <Input 
                                                        placeholder="Add Niche Domain (e.g. Neuromorphic Computing)" 
                                                        value={newInterest}
                                                        onChange={(e) => setNewInterest(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
                                                        className="h-14 bg-muted/20 border-white/5 rounded-2xl font-bold"
                                                    />
                                                    <Button onClick={addCustomInterest} className="h-14 w-14 rounded-2xl bg-white text-black hover:bg-white/90">
                                                        <Plus className="w-6 h-6" />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {tempInterests.filter(i => !CATEGORIES.includes(i)).map(interest => (
                                                        <Badge key={interest} className="h-10 px-4 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                                                            {interest}
                                                            <X className="w-3 h-3 cursor-pointer" onClick={() => toggleInterest(interest)} />
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-4 pt-4">
                                                <Button 
                                                    className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest"
                                                    onClick={handleSaveInterests}
                                                >
                                                    Commit Profile Changes
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-wrap gap-3"
                                        >
                                            {data.research_interests.length > 0 ? data.research_interests.map(interest => (
                                                <span key={interest} className="h-12 px-6 flex items-center bg-primary/5 text-primary border border-primary/20 rounded-[1.2rem] text-[11px] 2xl:text-sm font-black uppercase tracking-widest shadow-sm">
                                                    {interest}
                                                </span>
                                            )) : (
                                                <p className="text-muted-foreground italic font-mono text-xs opacity-40">Identity domain profile currently unpopulated.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    )}

                    {/* Application Status Section */}
                    {role !== 'admin' && data.application && (
                        <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] 2xl:rounded-[3.5rem]">
                            <CardContent className="p-10 2xl:p-14">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <h3 className="font-serif text-2xl 2xl:text-3xl font-black text-foreground">Vetting Narrative</h3>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-40">Current Institutional Status</p>
                                    </div>
                                    <Badge className={cn(
                                        "h-10 px-8 rounded-2xl text-[10px] font-black tracking-widest uppercase border-none",
                                        data.application.status === 'approved' ? 'bg-emerald-600 shadow-emerald-500/30' :
                                        data.application.status === 'rejected' ? 'bg-rose-700 shadow-rose-500/30' :
                                        'bg-amber-600 shadow-amber-500/30'
                                    )}>
                                        {data.application.status}
                                    </Badge>
                                </div>

                                <div className={cn(
                                    "p-10 rounded-[2rem] border relative overflow-hidden",
                                    data.application.status === 'approved' ? 'bg-emerald-600/5 border-emerald-500/20' :
                                    data.application.status === 'rejected' ? 'bg-rose-600/5 border-rose-500/20' :
                                    'bg-amber-600/5 border-amber-500/20'
                                )}>
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex items-center gap-4">
                                            {data.application.status === 'approved' ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : 
                                             data.application.status === 'rejected' ? <XCircle className="w-8 h-8 text-rose-500" /> : 
                                             <Clock className="w-8 h-8 text-amber-500 animate-pulse" />}
                                            <h4 className="font-serif text-xl font-bold">
                                                {data.application.status === 'approved' ? "Board Membership Confirmed" :
                                                 data.application.status === 'rejected' ? "Vetting Outcome | Board Action" :
                                                 "Dossier Under Review"}
                                            </h4>
                                        </div>
                                        
                                        {data.application.status === 'rejected' && data.application.rejection_reason && (
                                            <div className="mt-6 p-6 bg-black/40 rounded-2xl border border-rose-500/30 backdrop-blur-md">
                                                <p className="font-serif text-base 2xl:text-lg leading-relaxed text-rose-100/70 italic">
                                                    "{data.application.rejection_reason}"
                                                </p>
                                                <div className="mt-4 pt-4 border-t border-rose-500/10 text-[10px] uppercase font-black text-rose-500 opacity-60">
                                                    Finalized Outcome Broadcast
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-xs 2xl:text-sm text-foreground/60 leading-relaxed max-w-2xl">
                                            {data.application.status === 'approved' ? `Your professional profile has been active since ${new Date(data.application.reviewed_at!).toLocaleDateString()}. You have access to all peer-review modules.` :
                                             data.application.status === 'rejected' ? "After formal evaluation of provided documentation and research footprint, the board has concluded to reject this application. Refer to rationale above." :
                                             "Vetting protocols are currently analyzing your academic footprint. Standard processing time is 48-72 hours."}
                                        </p>
                                    </div>
                                    
                                    {/* Abstract Aesthetic Background SVG */}
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4 scale-150">
                                        {data.application.status === 'approved' ? <CheckCircle2 className="w-64 h-64" /> : 
                                         data.application.status === 'rejected' ? <XCircle className="w-64 h-64" /> : 
                                         <Clock className="w-64 h-64" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* History Section */}
                    {role !== 'admin' && role !== 'editor' && (
                        <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] 2xl:rounded-[3.5rem]" ref={role === 'author' ? sectionRefs['Submission History'] : sectionRefs['Activity History']}>
                            <CardContent className="p-10 2xl:p-14">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <h3 className="font-serif text-2xl 2xl:text-3xl font-black text-foreground">
                                            {role === 'author' ? "Submission History" : "Peer-Review Repository"}
                                        </h3>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-40">Professional Activity Timeline</p>
                                    </div>
                                    <Button variant="outline" className="h-10 px-8 rounded-2xl border-white/10 text-[9px] font-black uppercase tracking-widest gap-2 bg-white/5" asChild>
                                        <Link href={role === 'author' ? "/author/submissions" : "/reviewer/reviews"}>
                                            View Full Registry <ChevronDown className="w-3 h-3 -rotate-90" />
                                        </Link>
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {data.history.length > 0 ? data.history.map((item, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-6 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-3xl transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center border border-white/5 shadow-xl group-hover:scale-105 transition-transform">
                                                    <FileText className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h5 className="font-serif text-lg font-bold line-clamp-1">{item.title}</h5>
                                                    <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground opacity-60">
                                                        <span>Logged: {new Date(item.created_at || item.updated_at).toLocaleDateString()}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                                        <span>PID-000{idx + 128}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="h-8 px-5 rounded-xl text-[9px] font-black uppercase border-white/10 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {item.status || item.decision || 'Completed'}
                                            </Badge>
                                        </div>
                                    )) : (
                                        <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 opacity-30 grayscale">
                                            <div className="bg-muted p-8 rounded-[2.5rem] border border-white/10">
                                                <Search className="w-16 h-16" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-serif text-2xl font-bold tracking-tight">Archive Registry Empty</h4>
                                                <p className="font-mono text-[10px] uppercase tracking-widest">No activity footprints detected in sector</p>
                                            </div>
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
