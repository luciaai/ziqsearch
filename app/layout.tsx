import './globals.css';
import 'katex/dist/katex.min.css';
import 'leaflet/dist/leaflet.css';

import { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Baumans } from 'next/font/google';
import localFont from 'next/font/local';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from '@/components/ui/sonner';
import { ClientAnalytics } from '@/components/client-analytics';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BodyStyleCleanup } from '@/components/body-style-cleanup';

import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://ziqsearch.com'),
  title: {
    default: 'Ziq - Think it. Find it. Cite it.',
    template: '%s | Ziq',
  },
  description:
    'Ziq is a free Agentic Research Platform that finds, analyzes, and cites information from the live web. Perfect for students, homeschoolers, and researchers.',
  openGraph: {
    url: 'https://ziqsearch.com',
    siteName: 'Ziq',
    title: 'Ziq - Think it. Find it. Cite it.',
    description: 'Ziq is a free Agentic Research Platform that finds, analyzes, and cites information from the live web.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Ziq - Think it. Find it. Cite it.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ziq - Think it. Find it. Cite it.',
    description: 'Ziq is a free Agentic Research Platform that finds, analyzes, and cites information from the live web.',
    images: ['/opengraph-image'],
  },
  keywords: [
    'agentic research platform',
    'agentic research',
    'agentic search',
    'agentic search engine',
    'agentic search platform',
    'agentic search tool',
    'agentic search tool',
    'ziqsearch',
    'ziq',
    'ziq ai',
    'Ziq',
    'Ziq AI',
    'ziqsearch.com',
    'free ai search',
    'ai search',
    'ai research tool',
    'ai search tool',
    'perplexity ai alternative',
    'perplexity alternative',
    'chatgpt alternative',
    'ai search engine',
    'search engine',
    'MiniPerplx',
    'Perplexity alternatives',
    'Perplexity AI alternatives',
    'open source ai search engine',
    'minimalistic ai search engine',
    'minimalistic ai search alternatives',
    'ai search',
    'minimal ai search',
    'minimal ai search alternatives',
    'Ziq (Formerly MiniPerplx)',
    'AI Search Engine',
    'mplx.run',
    'mplx ai',
    'search engine',
    'AI',
    'perplexity',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F9F9' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
};

const sfPro = localFont({
  src: [
    {
      path: '../public/fonts/SF-Pro.ttf',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../public/fonts/SF-Pro-Italic.ttf',
      weight: '100 900',
      style: 'italic',
    },
  ],
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

const baumans = Baumans({
  subsets: ['latin'],
  variable: '--font-baumans',
  preload: true,
  display: 'swap',
  weight: ['400'],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sfPro.variable} ${beVietnamPro.variable} ${baumans.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <NuqsAdapter>
          <Providers>
            <SidebarProvider>
              <BodyStyleCleanup />
              <Toaster position="top-center" />
              {children}
            </SidebarProvider>
          </Providers>
        </NuqsAdapter>
        <ClientAnalytics />
      </body>
    </html>
  );
}
