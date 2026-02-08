'use client';

import { useState, useEffect } from 'react';
import HistorySidebar from './HistorySidebar';
import { getCacheStats } from '@/lib/cache';

export default function HistoryButton() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const stats = getCacheStats();
      setCacheCount(stats.entries);
    };

    // Update immediately
    updateCount();

    // Update count periodically (every 2 seconds)
    const interval = setInterval(updateCount, 2000);

    return () => clearInterval(interval);
  }, [isSidebarOpen]);

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="group relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
        aria-label="Open history"
      >
        <div className="flex items-center gap-2 relative">
          <svg
            className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="hidden sm:inline">History</span>
          
          {/* Count badge */}
          {cacheCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-full animate-[zoomIn_0.2s_ease-out]">
              {cacheCount > 99 ? '99+' : cacheCount}
            </span>
          )}
        </div>
        
        {/* Animated underline */}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 dark:bg-gray-100 transition-all duration-300 group-hover:w-full"></span>
      </button>

      <HistorySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
