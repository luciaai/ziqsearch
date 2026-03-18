import React from 'react';
import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/sidebar-layout';

export const metadata: Metadata = {
  title: 'Search X - Natural Language X/Twitter Search',
  description:
    'Search X (formerly Twitter) posts using natural language queries. Find posts by user, topic, date range, and more with advanced filtering options.',
  keywords: 'X search, Twitter search, social media search, natural language search, X posts, tweet search',
  openGraph: {
    title: 'Search X - Natural Language X/Twitter Search',
    description:
      'Search X (formerly Twitter) posts using natural language queries. Find posts by user, topic, date range, and more with advanced filtering options.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search X - Natural Language X/Twitter Search',
    description:
      'Search X (formerly Twitter) posts using natural language queries. Find posts by user, topic, date range, and more with advanced filtering options.',
  },
};

interface XQLLayoutProps {
  children: React.ReactNode;
}

export default function XQLLayout({ children }: XQLLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
