import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="text-[10px] font-black  tracking-[0.3em] opacity-40">Synchronizing Data</p>
        </div>
    );
}
