"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, Send, BookOpen } from "lucide-react"

interface SubmissionProgressProps {
    status: string
    className?: string
}

const STEPS = [
    { id: 'submitted', label: 'Submitted', icon: Send, statuses: ['submitted'] },
    { id: 'review', label: 'Peer Review', icon: Clock, statuses: ['editor_assigned', 'under_review', 'revision_requested'] },
    { id: 'accepted', label: 'Accepted', icon: CheckCircle2, statuses: ['accepted', 'payment_pending'] },
    { id: 'published', label: 'Published', icon: BookOpen, statuses: ['published'] },
]

export function SubmissionProgress({ status, className }: SubmissionProgressProps) {
    const getCurrentStepIndex = () => {
        if (status === 'published') return 3
        if (['accepted', 'payment_pending'].includes(status)) return 2
        if (['editor_assigned', 'under_review', 'revision_requested'].includes(status)) return 1
        return 0
    }

    const currentIdx = getCurrentStepIndex()

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative flex justify-between">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out" 
                    style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                {STEPS.map((step, idx) => {
                    const Icon = step.icon
                    const isCompleted = idx < currentIdx || status === 'published'
                    const isActive = idx === currentIdx && status !== 'published'
                    
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                                isActive ? "bg-background border-primary text-primary" : 
                                "bg-background border-muted text-muted-foreground"
                            )}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={cn(
                                "transition-colors duration-300",
                                (isCompleted || isActive) ? "text-foreground" : "text-muted-foreground opacity-50"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
