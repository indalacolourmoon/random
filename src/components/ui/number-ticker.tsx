"use client";

import { AnimateNumber } from 'motion-number';

interface NumberTickerProps {
    value: number | bigint | string;
    className?: string;
    prefix?: string;
    suffix?: string;
    format?: Omit<Intl.NumberFormatOptions, "notation"> & {
        notation?: "standard" | "compact";
    };
}

export function NumberTicker({ 
    value, 
    className, 
    prefix, 
    suffix,
    format
}: NumberTickerProps) {
    return (
        <span className={className}>
            <AnimateNumber
                format={format || { notation: 'standard' }}
                transition={{ layout: { type: 'spring', duration: 0.7, bounce: 0 } }}
                prefix={prefix}
                suffix={suffix}
            >
                {value}
            </AnimateNumber>
        </span>
    );
}
