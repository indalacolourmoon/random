'use client';

import Script from 'next/script';

interface JsonLdProps {
  data: Record<string, any>;
  id?: string;
}

/**
 * A reusable component for injecting JSON-LD structured data into the page.
 * This is a key requirement for Generative Engine Optimization (GEO).
 */
export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <Script
      id={id || `json-ld-${Math.random().toString(36).substr(2, 9)}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
