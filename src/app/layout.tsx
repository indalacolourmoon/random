import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.org'),
  title: {
    default: "IJITEST | International Journal of Innovative Trends in Engineering Science and Technology",
    template: "%s | IJITEST"
  },
  description: "Elite International Peer-Reviewed Journal for High-Quality Research in Engineering, Science, and Technology. Fast Track Publication & Global Indexing.",
  keywords: [
    "Academic Journal",
    "Engineering Research",
    "Scientific Publication",
    "Innovative Trends",
    "Technology Journal",
    "Peer Reviewed",
    "IJITEST",
    "International Journal"
  ],
  authors: [{ name: "IJITEST Editorial Board" }],
  creator: "IJITEST",
  publisher: "IJITEST",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "IJITEST | International Journal of Innovative Trends in Engineering Science and Technology",
    description: "Global platform for breakthrough research in engineering and technology.",
    url: 'https://ijitest.org',
    siteName: 'IJITEST',
    images: [
      {
        url: '/open_graph_img.png',
        width: 1200,
        height: 630,
        alt: 'IJITEST - Scholarly Excellence',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IJITEST | Academic Excellence',
    description: 'Leading international journal for innovative engineering research.',
    images: ['/open_graph_img.png'],
  },
  icons: {
    icon: [
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon_io/apple-touch-icon.png',
  },
};

import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import SmoothScroll from "@/providers/SmoothScroll";
import ScrollToTop from "@/components/common/ScrollToTop";

import { NuqsAdapter } from "nuqs/adapters/next";

import { JsonLd } from "@/components/shared/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = {
    journal_name: "IJITEST | International Journal of Innovative Trends in Engineering Science and Technology",
    journal_short_name: "IJITEST",
    url: "https://ijitest.org",
    logo: "https://ijitest.org/favicon_io/apple-touch-icon.png"
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": settings.journal_name,
    "alternateName": settings.journal_short_name,
    "url": settings.url,
    "logo": settings.logo,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };

  const journalSchema = {
    "@context": "https://schema.org",
    "@type": "ScholarlyJournal",
    "name": settings.journal_name,
    "alternateName": settings.journal_short_name,
    "url": settings.url,
    "publisher": {
      "@type": "Organization",
      "name": "IJITEST Publishing"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-sans`}>
        <JsonLd data={organizationSchema} id="global-org" />
        <JsonLd data={journalSchema} id="global-journal" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <SmoothScroll>
              <AuthProvider>
                <QueryProvider>
                  <TooltipProvider>
                    {children}
                    <ScrollToTop />
                    <Toaster position="top-right" offset={50} richColors closeButton />
                  </TooltipProvider>
                </QueryProvider>
              </AuthProvider>
            </SmoothScroll>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
