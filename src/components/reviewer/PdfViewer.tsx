"use client"

import React, { useState } from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface PdfViewerProps {
    pdfUrl: string
    title: string
}

export function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
    const [isHovered, setIsHovered] = useState(false)

    const openInNewWindow = () => {
        window.open(pdfUrl, '_blank')
    }

    return (
        <div
            className="relative w-full h-full bg-white group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Iframe */}
            <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title={title}
            />

            {/* Controls Overlay */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl z-20"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={openInNewWindow}
                            className="h-10 px-6 gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
                        >
                            <ExternalLink className="w-4 h-4" /> Open in New Window
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Corner Badge */}
            <div className="absolute top-4 right-4 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 backdrop-blur-md border border-primary/20">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Interactive Viewer</span>
                </div>
            </div>
        </div>
    )
}
