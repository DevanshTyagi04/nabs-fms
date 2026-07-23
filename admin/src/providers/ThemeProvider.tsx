'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '@packages/shared-types';
import { lightColors, darkColors, ThemeColors } from '@packages/design-tokens';
import { config } from '@/config';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem(config.theme.storageKey) as ThemeMode | null;
    if (saved) {
      setModeState(saved);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let computedMode: 'light' | 'dark' = 'light';

    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      computedMode = systemDark ? 'dark' : 'light';
    } else {
      computedMode = mode;
    }

    setResolvedMode(computedMode);

    if (computedMode === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(config.theme.storageKey, newMode);
  };

  const toggleTheme = () => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  const colors = resolvedMode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, colors, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
