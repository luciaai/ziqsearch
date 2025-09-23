import './globals.css';
import 'katex/dist/katex.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Geist } from 'next/font/google';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';

import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://ziqsearch.com'),
  title: {
    default: 'Ziq',
    template: '%s | Ziq',
    absolute: 'Ziq',
  },
  description: 'Ziq is a minimalistic AI-powered search engine that helps you find information on the internet.',
  openGraph: {
    url: 'https://ziqsearch.com',
    siteName: 'Ziq',
  },
  keywords: [
    'ziqsearch.com',
    'ziqsearch.com',
    'ziq.ai',
    'ai search engine',
    'ziq',
    'Ziq',
    'ZIQ',
    'ziq search',
    'Ziq Search',
    'ai search engine',
    'Perplexity alternatives',
    'Perplexity AI alternatives',
    'open source ai search engine',
    'minimalistic ai search engine',
    'minimalistic ai search alternatives',
    'ai search',
    'minimal ai search',
    'minimal ai search alternatives',
    'AI Search Engine',
    'search engine',
    'AI',
    'perplexity',
    'search less discover more',
    'empower your curiosity',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  preload: true,
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  variable: '--font-be-vietnam-pro',
  preload: true,
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${beVietnamPro.variable} font-sans antialiased`} suppressHydrationWarning>
        <NuqsAdapter>
          <Providers>
            <Toaster position="top-center" />
            {children}
          </Providers>
        </NuqsAdapter>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
