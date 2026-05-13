'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component to clean up body styles that Radix UI dialogs/sheets
 * sometimes leave behind when navigating between pages
 */
export function BodyStyleCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    // Clean up any lingering body styles on route change
    const cleanupBodyStyles = () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-locked');
    };

    cleanupBodyStyles();
  }, [pathname]);

  return null;
}
