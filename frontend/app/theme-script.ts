/**
 * Theme Script
 * 
 * Inline script to set theme before React hydration.
 * Prevents flash of wrong theme (FOUC - Flash of Unstyled Content).
 * This script runs immediately and sets dark mode as default.
 */

export const themeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme');
      const theme = savedTheme === 'light' ? 'light' : 'dark'; // Default to dark
      document.documentElement.classList.toggle('dark', theme === 'dark');
    } catch (e) {
      // Fallback to dark mode if localStorage fails
      document.documentElement.classList.add('dark');
    }
  })();
`;
