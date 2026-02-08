/**
 * Home Page
 * 
 * Main landing page of the STEELMAN application.
 * Features:
 * - URL input form
 * - Minimalist design
 * - Mobile-responsive design
 */

'use client';

import { useState } from 'react';
import ClaimInput, { InputMode } from '@/components/ClaimInput';

/**
 * Home Page Component
 * 
 * Renders the main page with:
 * - Header and description
 * - URL input form
 * - Footer disclaimer
 */
export default function Home() {
  const [mode, setMode] = useState<InputMode>('url');

  return (
    <main className="min-h-screen bg-white dark:bg-black py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center flex flex-col items-center">
          {/* Logo */}
          <div className="relative -mb-8 z-10">
            <img src="/logo.png" alt="Steelman Logo" className="h-64 w-64 object-contain" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase leading-none relative z-0">
            STEELMAN
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-light max-w-xl mx-auto mt-6 transition-all duration-300">
            {mode === 'url'
              ? "The Steelman Argument is the practice of constructing the strongest, most persuasive version of an opponent's argument. Enter an article URL."
              : "The Steelman Argument is the practice of constructing the strongest, most persuasive version of an opponent's argument. Enter a claim."
            }
          </p>
        </div>

        {/* Main Input Form */}
        <div className="bg-transparent">
          <ClaimInput onModeChange={setMode} />
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest mt-16">
          <p>
            Designed for critical thinking. Verify all information.
          </p>
        </div>
      </div>
    </main>
  );
}
