'use client';

import React from 'react';
import { useFontSizeContext } from '@/contexts/font-size-context';
import { Type } from 'lucide-react';

export function FontSizeSlider() {
  const { fontSize, setFontSize } = useFontSizeContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
  };

  const handleReset = () => {
    setFontSize(100);
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border border-border/50">
      <Type className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground shrink-0">A</span>
      <input
        type="range"
        min="80"
        max="200"
        step="5"
        value={fontSize}
        onChange={handleChange}
        className="w-32 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((fontSize - 80) / 120) * 100}%, hsl(var(--border)) ${((fontSize - 80) / 120) * 100}%, hsl(var(--border)) 100%)`
        }}
      />
      <span className="text-xs text-muted-foreground shrink-0">A</span>
      <button
        onClick={handleReset}
        className="text-xs font-medium text-muted-foreground hover:text-foreground min-w-[2.5rem] text-center transition-colors shrink-0"
      >
        {fontSize}%
      </button>
    </div>
  );
}
