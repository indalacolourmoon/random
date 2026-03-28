'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[3rem] border border-red-50 shadow-xl shadow-red-500/5 my-10 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className=" font-serif font-black text-gray-900 mb-4 ">Interruption in Services</h2>
            <p className="text-gray-500 mb-10 font-medium  leading-relaxed">
                An unexpected technical error has occurred while processing your request. Our systems have logged this event for administrative review.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs  tracking-widest hover:bg-primary/95 transition-all shadow-lg shadow-primary/20"
                >
                    <RotateCcw className="w-4 h-4" /> Restart Segment
                </button>
                <Link
                    href="/"
                    className="flex items-center justify-center px-8 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-xs  tracking-widest hover:bg-gray-50 transition-all"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
