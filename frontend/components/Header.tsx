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
          <div className="flex items-center gap-8">
            {/* App Title */}
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Fact Checker
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex gap-6">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/analyze"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Analyze Article
              </Link>
            </nav>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
