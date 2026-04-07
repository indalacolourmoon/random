import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    container?: boolean;
    padding?: boolean;
    background?: 'default' | 'muted' | 'gradient';
    containerClassName?: string;
}

export function Section({
    children,
    className,
    container = true,
    padding = true,
    background = 'default',
    containerClassName,
    ...props
}: SectionProps) {
    return (
        <section
            className={cn(
                padding && "section-padding",
                background === 'muted' && "bg-muted/20",
                background === 'gradient' && "bg-linear-to-br from-primary/5 to-transparent",
                "relative z-10",
                className
            )}
            {...props}
        >
            {container ? (
                <div className={cn("container-responsive", containerClassName)}>
                    {children}
                </div>
            ) : children}
        </section>
    );
}
