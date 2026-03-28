'use client';

import { useEffect } from 'react';
import { ShieldAlert, RotateCcw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-gray-100 shadow-sm mx-auto">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                <ShieldAlert className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className=" font-black text-foreground tracking-wider uppercase">Portal Access Error</h2>
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-10 max-w-md mx-auto">
                The administrative operation could not be completed. This may be due to a session timeout or a database communication failure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                    <RotateCcw className="w-4 h-4" /> Retry Operation
                </button>
                <Link
                    href="/admin"
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-primary/5 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/10 cursor-pointer"
                >
                    <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
