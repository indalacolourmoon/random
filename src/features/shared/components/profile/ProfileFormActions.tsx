"use client";

import React from 'react';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';
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
            {status && (
                <div className={`p-4 rounded-lg flex items-center gap-4 border border-border/50 shadow-sm ${status.success
                    ? 'bg-emerald-500/5 text-emerald-600'
                    : 'bg-rose-500/5 text-rose-600'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status.success ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                        {status.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                            {status.success ? 'Success' : 'Error'}
                        </p>
                        <p className="text-xs font-semibold opacity-90">
                            {status.success
                                ? 'Profile updated successfully.'
                                : status.error}
                        </p>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-8 gap-2 bg-[#000066] text-white hover:bg-[#000088] transition-all rounded-lg shadow-sm disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{isSubmitting ? "Saving..." : "Save Profile"}</span>
                </Button>
            </div>
        </div>
    );
});

ProfileFormActions.displayName = 'ProfileFormActions';
