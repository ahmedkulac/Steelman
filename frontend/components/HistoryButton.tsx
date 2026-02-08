/**
 * HistoryButton Component
 * 
 * Button component that provides quick access to claim history.
 * Features:
 * - Shows cached claim count badge
 * - Quick access dropdown with recent claims
 * - Keyboard shortcut (Ctrl/Cmd + H)
 * - Opens full history sidebar on double-click
 * - Hydration-safe: avoids localStorage access during SSR
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import HistorySidebar from './HistorySidebar';
import { getCacheStats, getAllCachedClaims } from '@/lib/cache';
import { Claim } from '@/lib/api/claims';

interface CachedClaimEntry {
  claim: string;
  data: Claim;
  cachedAt: number;
  expiresAt: number;
}

export default function HistoryButton() {
  // ===== State Management =====
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  /**
   * Initialize with empty state to ensure server/client hydration match.
   * localStorage is only accessed in useEffect (client-side only).
   * This prevents hydration errors where server renders empty state
   * but client renders with cached data.
   */
  const [cacheCount, setCacheCount] = useState(0);
  const [recentClaims, setRecentClaims] = useState<CachedClaimEntry[]>([]);
  
  // Refs for dropdown and button elements (for click-outside detection)
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ===== Effects =====
  
  /**
   * Load cached data and set up real-time updates.
   * 
   * This effect:
   * 1. Loads cache stats and recent claims on mount (client-side only)
   * 2. Listens for storage events (cross-tab updates)
   * 3. Listens for custom cacheUpdated events (same-tab updates)
   * 4. Polls periodically as a fallback
   * 
   * Note: Runs after component mounts to avoid hydration mismatches.
   */
  useEffect(() => {
    /**
     * Update cache count and recent claims from localStorage
     */
    const updateCount = () => {
      try {
        const stats = getCacheStats();
        setCacheCount(stats.entries);
        
        // Load recent claims for dropdown - localStorage access is synchronous
        const claims = getAllCachedClaims<Claim>();
        // Sort by most recent (newest first) and take top 5
        const sorted = claims.sort((a, b) => b.cachedAt - a.cachedAt).slice(0, 5);
        setRecentClaims(sorted);
      } catch (error) {
        // Handle errors gracefully - reset to empty state
        setCacheCount(0);
        setRecentClaims([]);
      }
    };

    // Initial load on mount
    updateCount();

    // Handle cross-tab storage changes (when cache is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('fact_checker_')) {
        updateCount();
      }
    };

    // Handle same-tab cache updates (via custom event from cache.ts)
    const handleCacheUpdate = () => {
      updateCount();
    };

    // Set up event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cacheUpdated', handleCacheUpdate as EventListener);

    // Periodic update as fallback (every 2 seconds)
    const interval = setInterval(updateCount, 2000);

    // Cleanup: remove event listeners and clear interval
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cacheUpdated', handleCacheUpdate as EventListener);
      clearInterval(interval);
    };
  }, [isSidebarOpen, isDropdownOpen]);

  /**
   * Keyboard shortcut: Ctrl/Cmd + H to open history sidebar
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Close dropdown when clicking outside of it
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // ===== Event Handlers =====
  
  /**
   * Handle button click:
   * - If there are cached claims: toggle dropdown
   * - Otherwise: open full sidebar
   */
  const handleButtonClick = (e: React.MouseEvent) => {
    if (cacheCount > 0 && recentClaims.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setIsSidebarOpen(true);
    }
  };

  // ===== Helper Functions =====
  
  /**
   * Format timestamp as relative date (e.g., "3h ago", "2d ago")
   */
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    // For older dates, show month and day
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // ===== Render =====
  
  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          onDoubleClick={() => setIsSidebarOpen(true)}
          className="group relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
          aria-label="Open history (Ctrl+H or double-click for full history)"
          title="Click for quick access, double-click or Ctrl+H for full history"
        >
          <div className="flex items-center gap-2">
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
            {/* Count badge - positioned on the right */}
            {cacheCount > 0 && (
              <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-full animate-[zoomIn_0.2s_ease-out]">
                {cacheCount > 99 ? '99+' : cacheCount}
              </span>
            )}
          </div>
          
          {/* Animated underline */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 dark:bg-gray-100 transition-all duration-300 group-hover:w-full"></span>
        </button>

        {/* Quick Access Dropdown */}
        {isDropdownOpen && recentClaims.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Recent Claims
              </h3>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-y-auto max-h-80">
              {recentClaims.map((entry, index) => (
                <Link
                  key={index}
                  href={entry.data.id ? `/results/${entry.data.id}` : '/history'}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (!entry.data.id) {
                      setIsSidebarOpen(true);
                    }
                  }}
                  className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium line-clamp-2 mb-1">
                    {entry.data.content || entry.claim}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(entry.cachedAt)}</span>
                    {entry.data.steelmanArguments && (
                      <>
                        <span>•</span>
                        <span>{entry.data.steelmanArguments.length} counter-argument{entry.data.steelmanArguments.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <HistorySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
