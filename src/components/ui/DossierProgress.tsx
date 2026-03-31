"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface DossierProgressProps {
    percentage: number
    missing: string[]
    onChipClick: (field: string) => void
}

export function DossierProgress({
    percentage,
    missing,
    onChipClick
}: DossierProgressProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setProgress(percentage), 100)
        return () => clearTimeout(timer)
    }, [percentage])

    const getStatusColor = (p: number) => {
        if (p < 50) return "bg-rose-600 shadow-rose-600/30"
        if (p < 80) return "bg-amber-500 shadow-amber-500/30"
        return "bg-emerald-600 shadow-emerald-600/30"
    }

    const getTextColor = (p: number) => {
        if (p < 50) return "text-rose-600 bg-rose-600/10"
        if (p < 80) return "text-amber-500 bg-amber-500/10"
        return "text-emerald-600 bg-emerald-600/10"
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl transition-all", getTextColor(percentage))}>
                        {percentage === 100 ? <CheckCircle2 className="w-5 h-5 2xl:w-8 2xl:h-8" /> : <AlertCircle className="w-5 h-5 2xl:w-8 2xl:h-8" />}
                    </div>
                    <div>
                        <h4 className="font-serif text-xl 2xl:text-3xl font-black">{percentage}% COMPLETE</h4>
                        <p className="text-[10px] 2xl:text-xs font-mono uppercase tracking-widest text-muted-foreground opacity-60">Dossier Integrity Scan</p>
                    </div>
                </div>
                {percentage === 100 && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 text-emerald-500 rounded-full border border-emerald-500/20 animate-in fade-in zoom-in duration-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">PROFILE CERTIFIED</span>
                    </div>
                )}
            </div>

            <div className="relative h-2 2xl:h-4 w-full bg-muted/30 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                    className={cn("h-full transition-all duration-1000 ease-out rounded-full shadow-lg w-[var(--dossier-progress)]", getStatusColor(percentage))} 
                    style={{ '--dossier-progress': `${progress}%` } as React.CSSProperties}
                />
            </div>

            {missing.length > 0 ? (
                <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-500">
                    <span className="text-[10px] 2xl:text-sm font-black text-muted-foreground uppercase py-2 pr-2">Awaiting:</span>
                    {missing.map((field) => (
                        <button
                            key={field}
                            onClick={() => onChipClick(field)}
                            className="bg-muted hover:bg-primary/10 hover:text-primary border border-white/10 px-3 2xl:px-5 py-1.5 2xl:py-2.5 rounded-full text-[9px] 2xl:text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        >
                            {field}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/40" /> All Identity Requirements Fulfilled
                </div>
            )}
        </div>
    )
}
