import React from 'react';
import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/sidebar-layout';

export const metadata: Metadata = {
  title: 'Ziq Voice - AI Voice Assistant',
  description:
    'Talk to Ziq using natural voice conversations. Experience real-time AI voice interaction with advanced speech recognition and natural language understanding.',
  keywords: 'voice AI, speech recognition, voice assistant, conversational AI, voice chat, AI voice interaction',
  openGraph: {
    title: 'Ziq Voice - AI Voice Assistant',
    description:
      'Talk to Ziq using natural voice conversations. Experience real-time AI voice interaction with advanced speech recognition and natural language understanding.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ziq Voice - AI Voice Assistant',
    description:
      'Talk to Ziq using natural voice conversations. Experience real-time AI voice interaction with advanced speech recognition and natural language understanding.',
  },
};

interface VoiceLayoutProps {
  children: React.ReactNode;
}

export default function VoiceLayout({ children }: VoiceLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
