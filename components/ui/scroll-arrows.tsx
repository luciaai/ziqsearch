'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollArrowsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

export const ScrollArrows: React.FC<ScrollArrowsProps> = ({ containerRef, className }) => {
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);

  const updateArrowVisibility = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, [containerRef]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check
    updateArrowVisibility();

    // Add listeners
    container.addEventListener('scroll', updateArrowVisibility);
    window.addEventListener('resize', updateArrowVisibility);

    // Observe content changes
    const observer = new MutationObserver(updateArrowVisibility);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      container.removeEventListener('scroll', updateArrowVisibility);
      window.removeEventListener('resize', updateArrowVisibility);
      observer.disconnect();
    };
  }, [updateArrowVisibility, containerRef]);

  const scrollLeft = React.useCallback(() => {
    containerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  }, [containerRef]);

  const scrollRight = React.useCallback(() => {
    containerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  }, [containerRef]);

  return (
    <>
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10',
            'h-8 w-8 rounded-full',
            'bg-background/90 hover:bg-background',
            'border border-border shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-200 hover:scale-110',
            className
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10',
            'h-8 w-8 rounded-full',
            'bg-background/90 hover:bg-background',
            'border border-border shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-200 hover:scale-110',
            className
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      )}
    </>
  );
};
