import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'X Wrapped - Analyze Any X Account with AI',
  description:
    'Analyze any public X account with AI. Get insights about posting activity, top topics, sentiment analysis, and more. Perfect for research and education.',
  openGraph: {
    title: 'X Wrapped - Analyze Any X Account with AI',
    description: 'AI-powered analysis of X accounts. Perfect for research, education, and insights.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'X Wrapped - AI Account Analysis',
    description: 'Analyze any public X account with AI-powered insights',
  },
};

export default function XWrappedLayout({ children }: { children: React.ReactNode }) {
  return children;
}

