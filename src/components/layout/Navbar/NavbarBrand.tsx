'use client'
import Link from 'next/link';
import NextImage from 'next/image';

interface NavbarBrandProps {
    shortName: string;
    isScrolled: boolean;
}

export function NavbarBrand({ shortName, isScrolled }: NavbarBrandProps) {
    return (
        <div className="flex items-center">
            <Link href="/" className="flex items-center gap-4 group transition-all duration-300 cursor-pointer">
                <div className="relative">
                    <NextImage
                        src="/logo.png"
                        alt={`${shortName} Logo`}
                        width={200}
                        height={96}
                        priority
                        className={`w-auto object-contain transition-all duration-500 ${isScrolled ? 'h-10 sm:h-12 2xl:h-20' : 'h-14 sm:h-16 2xl:h-24'} group-hover:scale-110 drop-shadow-sm`}
                    />
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>
            </Link>
        </div>
    );
}
