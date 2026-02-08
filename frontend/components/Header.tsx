/**
 * Header Component
 * 
 * Reusable header component with app title and theme toggle.
 * Features:
 * - App branding
 * - Theme toggle button
 * - Responsive design
 * - Navigation (future)
 */

'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

/**
 * Header Component
 * 
 * Renders the application header with:
 * - App title (clickable link to home)
 * - Theme toggle button
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* App Title */}
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors tracking-widest uppercase"
          >
            {/* Logo */}
            <img src="/logo.png" alt="Steelman Logo" className="h-8 w-8 object-contain" />
            STEELMAN
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
