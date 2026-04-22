'use client';

import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  RedditIcon,
  NewTwitterIcon,
  YoutubeIcon,
  GlobalSearchIcon,
  MicroscopeIcon,
  ArrowRight01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@/components/ui/hugeicons';

interface ExampleItem {
  text: string;
  group?: string;
}

interface Category {
  id: string;
  name: string;
  icon: typeof RedditIcon;
  examples: ExampleItem[];
  badge?: string;
}

const categories: Category[] = [
  {
    id: 'x',
    name: 'X Search',
    icon: NewTwitterIcon,
    examples: [
      { text: "What has Elon Musk posted about AI this week?", group: 'x' },
      { text: 'Latest announcements from OpenAI', group: 'x' },
      { text: 'Tips for using Claude Code with other models', group: 'x' },
      { text: 'What are developers saying about Cursor IDE?', group: 'x' },
    ],
  },
  {
    id: 'reddit',
    name: 'Reddit Search',
    icon: RedditIcon,
    examples: [
      { text: 'Best mechanical keyboards for programming', group: 'reddit' },
      { text: 'Productivity apps that actually work', group: 'reddit' },
      { text: 'Is the M5 MacBook Pro worth buying?', group: 'reddit' },
      { text: 'Budget headphones under $100', group: 'reddit' },
    ],
  },
  {
    id: 'research',
    name: 'Research',
    icon: MicroscopeIcon,
    badge: 'Deep',
    examples: [
      { text: 'Latest research on transformer architectures', group: 'academic' },
      { text: 'Compare RAG vs fine-tuning for LLMs with sources', group: 'extreme' },
      { text: 'Peer-reviewed papers on climate adaptation', group: 'academic' },
      { text: 'In-depth analysis of quantum computing progress', group: 'extreme' },
    ],
  },
  {
    id: 'media',
    name: 'Videos',
    icon: YoutubeIcon,
    examples: [
      { text: 'Best tutorials for learning Rust', group: 'youtube' },
      { text: 'Top tech review channels for MacBook Pro', group: 'youtube' },
      { text: 'Documentary recommendations about space', group: 'youtube' },
      { text: 'Recent conference talks on system design', group: 'youtube' },
    ],
  },
  {
    id: 'factcheck',
    name: 'Fact Check',
    icon: GlobalSearchIcon,
    examples: [
      { text: 'Is it true that honey never spoils?', group: 'web' },
      { text: 'Verify: humans only use 10% of their brain', group: 'web' },
      { text: 'Did Einstein really fail math?', group: 'web' },
      { text: 'Fact check the 5-second rule for food', group: 'web' },
    ],
  },
];

interface ExampleCategoriesProps {
  onSelectExample: (text: string, group?: string) => void;
  onCategorySelect?: (group: string) => void;
  className?: string;
}

export const ExampleCategories = memo(({ onSelectExample, onCategorySelect, className }: ExampleCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
    
    // Get the primary group for this category and update search mode
    const category = categories.find(c => c.id === categoryId);
    if (category && category.examples.length > 0 && category.examples[0].group) {
      onCategorySelect?.(category.examples[0].group);
    }
  }, [onCategorySelect]);

  const handleExampleSelect = useCallback(
    (text: string, group?: string) => {
      onSelectExample(text, group);
      setSelectedCategory(null);
    },
    [onSelectExample],
  );

  const handleDismiss = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  // Click outside to dismiss
  useEffect(() => {
    if (!selectedCategory) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setSelectedCategory(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedCategory]);

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className={cn('w-full relative', className)}>
      {/* Hero Section */}
      <div className="text-center mb-8 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Search Smarter
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered search across X, Reddit, YouTube, research papers, and the web.
            <br className="hidden sm:block" />
            Get answers with sources you can trust.
          </p>
        </motion.div>

        {/* Subtle gradient background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 -z-10 opacity-30 blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-full" />
        </div>
      </div>

      {/* Category Buttons - always visible and in flow */}
      <div
        className={cn(
          'flex items-center justify-center gap-2 flex-wrap transition-opacity duration-150',
          selectedCategory ? 'opacity-0 pointer-events-none' : 'opacity-100',
        )}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium',
              'border border-border/50 bg-background/50 backdrop-blur-sm text-foreground',
              'hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm',
              'transition-all duration-200',
            )}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <HugeiconsIcon icon={category.icon} size={16} strokeWidth={1.5} />
            <span>{category.name}</span>
            {category.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-md bg-primary/10 text-primary">
                {category.badge}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Expanded Card - absolutely positioned overlay */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            ref={cardRef}
            key={activeCategory.id}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-x-0 top-0 z-10 border border-border/50 rounded-xl bg-card/95 backdrop-blur-md shadow-xl"
          >
            {/* Header - clickable to dismiss */}
            <button
              onClick={handleDismiss}
              className="flex items-center justify-between w-full px-4 sm:px-5 py-3 sm:py-4 hover:bg-accent/50 transition-colors rounded-t-xl"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <HugeiconsIcon icon={activeCategory.icon} size={18} strokeWidth={1.5} className="text-primary" />
                </div>
                <span className="text-base sm:text-lg font-semibold">{activeCategory.name}</span>
                {activeCategory.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary/10 text-primary">
                    {activeCategory.badge}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg',
                  'text-muted-foreground hover:text-foreground',
                  'bg-muted/50 hover:bg-muted transition-colors',
                )}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
              </div>
            </button>

            {/* Examples */}
            <div className="p-2 sm:p-2.5 space-y-1">
              {activeCategory.examples.map((example, index) => (
                <motion.button
                  key={example.text}
                  onClick={() => handleExampleSelect(example.text, example.group)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    'group flex items-center justify-between w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg',
                    'text-left text-sm transition-all',
                    'text-muted-foreground hover:text-foreground',
                    'hover:bg-primary/5 hover:shadow-sm',
                    'border border-transparent hover:border-primary/20',
                  )}
                >
                  <span className="line-clamp-1 font-medium">{example.text}</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={14}
                    className="shrink-0 ml-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-70 group-hover:translate-x-0"
                    strokeWidth={2}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ExampleCategories.displayName = 'ExampleCategories';
