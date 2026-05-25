'use client';

import React, { createContext, useContext, useState } from 'react';

interface FontSizeContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage immediately (lazy initialization)
  const [fontSize, setFontSizeState] = useState<number>(() => {
    if (typeof window === 'undefined') return 100; // SSR fallback
    const saved = localStorage.getItem('scira-font-size-percent');
    return saved ? parseInt(saved) : 100;
  });

  // Save to localStorage whenever it changes
  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem('scira-font-size-percent', size.toString());
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSizeContext() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSizeContext must be used within FontSizeProvider');
  }
  return context;
}
