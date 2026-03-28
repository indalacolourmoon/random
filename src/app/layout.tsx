import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <AuthProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
