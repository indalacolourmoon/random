'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SubmissionSearchProps {
    placeholder?: string;
    onLocalFilter?: (query: string) => void;
}

export default function SubmissionSearch({
    placeholder = "Search...",
    onLocalFilter
}: SubmissionSearchProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(searchParams.get('q') || '');

    const handleSearch = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    }, [pathname, searchParams, query, router]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (onLocalFilter) {
            onLocalFilter(val);
        }
    }, [onLocalFilter]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1 group">
                <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isPending ? 'text-primary animate-pulse' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                <Input
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="h-14 pl-16 pr-6 bg-card border-border/50 rounded-xl text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all w-full"
                    placeholder={placeholder}
                />
            </div>
            <Button
                onClick={handleSearch}
                disabled={isPending}
                className="h-14 px-10 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap"
            >
                {isPending ? 'Processing...' : 'Search Registry'}
            </Button>
        </div>
    );
}
