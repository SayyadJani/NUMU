'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'numu-theme-mode';
const THEME_EVENT = 'numu-theme-change';

function applyDomTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const isDark = mode === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', mode);
  if (document.body) {
    document.body.classList.toggle('dark', isDark);
  }
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function broadcastThemeChange(mode: ThemeMode) {
  applyDomTheme(mode);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_EVENT, { detail: mode }));
  }
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    applyDomTheme(initial);

    const handleThemeEvent = (e: Event) => {
      const custom = e as CustomEvent<ThemeMode>;
      if (custom.detail === 'dark' || custom.detail === 'light') {
        setThemeState(custom.detail);
        applyDomTheme(custom.detail);
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeEvent);
    return () => window.removeEventListener(THEME_EVENT, handleThemeEvent);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    broadcastThemeChange(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = readStoredTheme();
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    broadcastThemeChange(next);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  const [fallbackTheme, setFallbackTheme] = useState<ThemeMode>(() => readStoredTheme());

  useEffect(() => {
    const initial = readStoredTheme();
    setFallbackTheme(initial);
    applyDomTheme(initial);

    const handleThemeEvent = (e: Event) => {
      const custom = e as CustomEvent<ThemeMode>;
      if (custom.detail === 'dark' || custom.detail === 'light') {
        setFallbackTheme(custom.detail);
        applyDomTheme(custom.detail);
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeEvent);
    return () => window.removeEventListener(THEME_EVENT, handleThemeEvent);
  }, []);

  const fallbackSetTheme = useCallback((mode: ThemeMode) => {
    setFallbackTheme(mode);
    broadcastThemeChange(mode);
  }, []);

  const fallbackToggleTheme = useCallback(() => {
    const current = readStoredTheme();
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    setFallbackTheme(next);
    broadcastThemeChange(next);
  }, []);

  if (ctx) {
    return ctx;
  }

  return {
    theme: fallbackTheme,
    isDark: fallbackTheme === 'dark',
    toggleTheme: fallbackToggleTheme,
    setTheme: fallbackSetTheme,
  };
}
