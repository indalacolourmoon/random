"use client"

import { useState, useRef, useEffect } from "react"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InlineEditFieldProps {
    label: string
    value: string
    onSave: (value: string) => Promise<void>
    readOnly?: boolean
    type?: "text" | "url"
    placeholder?: string
    icon?: React.ReactNode
    className?: string
}

export function InlineEditField({
    label,
    value,
    onSave,
    readOnly = false,
    type = "text",
    placeholder,
    icon,
    className
}: InlineEditFieldProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [currentValue, setCurrentValue] = useState(value)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setCurrentValue(value)
    }, [value])

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus()
        }
    }, [isEditing])

    const handleSave = async () => {
        if (currentValue === value) {
            setIsEditing(false)
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            await onSave(currentValue)
            setIsEditing(false)
        } catch (e: any) {
            setError(e.message || "Failed to save")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setCurrentValue(value)
        setIsEditing(false)
        setError(null)
    }

    return (
        <div className={cn("space-y-1.5 py-2 group/field", className)}>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block px-1">
                {label}
            </label>

            <div className="relative min-h-12 flex items-center">
                {isEditing ? (
                    <div className="flex w-full gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="relative flex-1">
                            {icon && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
                                    {icon}
                                </div>
                            )}
                            <Input
                                ref={inputRef}
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSave()
                                    if (e.key === "Escape") handleCancel()
                                }}
                                placeholder={placeholder}
                                disabled={isLoading}
                                className={cn(
                                    "h-12 bg-background/50 border-primary/20 rounded-xl font-bold transition-all focus:border-primary focus:ring-1 focus:ring-primary/20",
                                    icon && "pl-10"
                                )}
                            />
                        </div>
                        <div className="flex gap-1">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleSave}
                                disabled={isLoading}
                                className="h-10 w-10 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-xl"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex w-full justify-between items-center group transition-all">
                        <div className="flex items-center gap-3 px-1 overflow-hidden">
                            {icon && <div className="opacity-40 shrink-0">{icon}</div>}
                            <span className={cn(
                                "font-serif text-lg 2xl:text-xl font-bold truncate transition-colors",
                                !value && "text-muted-foreground italic font-sans text-base opacity-40"
                            )}>
                                {value || placeholder || "Not set"}
                            </span>
                        </div>
                        
                        {!readOnly && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsEditing(true)}
                                className="h-10 w-10 opacity-0 group-hover/field:opacity-100 focus:opacity-100 transition-opacity rounded-xl text-primary hover:bg-primary/5"
                                aria-label={`Edit ${label}`}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-[10px] text-rose-500 font-bold uppercase transition-all px-1">
                    {error}
                </p>
            )}
        </div>
    )
}
