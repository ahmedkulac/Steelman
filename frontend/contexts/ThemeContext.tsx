/**
 * Theme Context
 * 
 * Provides theme management (light/dark mode) across the application.
 * Features:
 * - Dark mode as default
 * - localStorage persistence
 * - SSR-safe implementation
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider Component
 * 
 * Manages theme state and applies it to the document root.
 * Defaults to dark mode if no preference is stored.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme state - check localStorage synchronously if available
  const getInitialTheme = (): Theme => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }
    }
    // Default to dark mode
    return 'dark';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  /**
   * Apply theme to document root
   * Adds/removes 'dark' class from <html> element
   */
  const applyTheme = (newTheme: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  /**
   * Initialize theme on mount
   * Applies the theme to the document root when component mounts
   */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /**
   * Update theme state and persist to localStorage
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    applyTheme(newTheme);
  };

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Always provide the context, even before mounting
  // This prevents the "useTheme must be used within ThemeProvider" error
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * 
 * Custom hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
