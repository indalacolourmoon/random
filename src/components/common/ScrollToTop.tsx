"use client"

import React, { useEffect, useState, memo, useCallback } from "react"
import { useLenis } from "lenis/react"
import { ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

function ScrollToTopComponent() {
  const [isVisible, setIsVisible] = useState(false)
  const lenis = useLenis()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    if (lenis) {
      lenis.scrollTo(0, { lerp: 0.1, duration: 1.5 })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [lenis])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-8 right-8 z-[100] "
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="rounded-full w-12 h-12 shadow-2xl bg-primary hover:bg-primary/90 text-white backdrop-blur-sm border border-white/20 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(ScrollToTopComponent);
