'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useEffect, useState, useRef } from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
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

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (onLocalFilter) {
            onLocalFilter(val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
            <InputGroup className="flex-1 h-14 bg-card border-primary/50 rounded-xl shadow-inner group/search SubmissionSearch transition-all focus-within:border-primary/20">
                <InputGroupAddon className="pl-5">
                    <Search className={`w-5 h-5 transition-colors ${isPending ? 'text-primary animate-pulse' : 'text-primary/30 group-focus-within/search:text-primary'}`} />
                </InputGroupAddon>
                <InputGroupInput
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="text-sm font-bold placeholder:text-primary/40 cursor-text px-5"
                    placeholder={placeholder}
                />
            </InputGroup>
            <Button
                onClick={handleSearch}
                disabled={isPending}
                className="h-14 px-8 bg-primary text-white dark:text-black font-black text-[10px] tracking-[0.2em] uppercase rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
                {isPending ? 'Processing...' : 'Search Database'}
            </Button>
        </div>
    );
}
