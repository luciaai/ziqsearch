'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FontSizeContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<number>(100);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('scira-font-size-percent');
    if (saved) {
      setFontSizeState(parseInt(saved));
    }
  }, []);

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
