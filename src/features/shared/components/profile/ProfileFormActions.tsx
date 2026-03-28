"use client";

import React from 'react';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface ProfileFormActionsProps {
    isSubmitting: boolean;
    status: { success?: boolean; error?: string } | null;
}

export const ProfileFormActions = React.memo(({
    isSubmitting,
    status
}: ProfileFormActionsProps) => {
    return (
        <div className="space-y-6">
            {/* Feedback Messages */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className={`p-4 rounded-xl flex items-center gap-4 border-l-4 shadow-sm ${status.success
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                            : 'bg-rose-500/10 border-rose-500 text-rose-600'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.success ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'
                            }`}>
                            {status.success ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-[10px] uppercase tracking-widest">
                                {status.success ? 'Success' : 'Error'}
                            </p>
                            <p className="text-sm opacity-90 font-medium">
                                {status.success
                                    ? 'Your profile has been updated successfully.'
                                    : status.error}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 gap-2 bg-primary text-white dark:text-slate-900 hover:bg-primary/90 transition-all rounded-xl shadow-md disabled:bg-muted"
                >
                    {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span className="text-xs font-black uppercase tracking-widest">{isSubmitting ? "Saving Changes..." : "Save Profile Details"}</span>
                </Button>
            </div>
        </div>
    );
});

ProfileFormActions.displayName = 'ProfileFormActions';
