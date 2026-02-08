/**
 * HistorySidebar Component
 * 
 * Full-screen sidebar that displays cached claim history with:
 * - Search functionality
 * - Sort by date or category
 * - Expandable claim details
 * - Copy to clipboard for claims and arguments
 * - Real-time updates when cache changes
 * - Hydration-safe: avoids localStorage access during SSR
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAllCachedClaims, clearCache, removeCachedClaim } from '@/lib/cache';
import { Claim } from '@/lib/api/claims';
import CopyButton from './CopyButton';
import { formatHistoryDate, getTimeUntilExpiry } from '@/lib/dateUtils';

interface CachedClaimEntry {
  claim: string;
  data: Claim;
  cachedAt: number;
  expiresAt: number;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
  // ===== State Management =====
  
  /**
   * Initialize with empty state to ensure server/client hydration match.
   * localStorage is only accessed in useEffect (client-side only).
   * This prevents hydration errors where server renders empty state
   * but client renders with cached data.
   */
  const [cachedClaims, setCachedClaims] = useState<CachedClaimEntry[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<CachedClaimEntry[]>([]);
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');

  // ===== Callback Functions =====
  
  /**
   * Filter and sort claims based on search query and sort preference
   * 
   * @param claims - Array of cached claim entries
   * @param query - Search query string
   * @param sort - Sort mode: 'date' (newest first) or 'category' (alphabetical)
   */
  const filterAndSortClaims = useCallback((
    claims: CachedClaimEntry[],
    query: string,
    sort: 'date' | 'category'
  ) => {
    let filtered = [...claims];

    // Filter by search query (searches claim content and category)
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          (entry.data.content || entry.claim).toLowerCase().includes(lowerQuery) ||
          entry.data.category?.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort claims
    filtered.sort((a, b) => {
      if (sort === 'date') {
        // Sort by date: newest first
        return b.cachedAt - a.cachedAt;
      } else {
        // Sort by category: alphabetical, then by date
        const catA = a.data.category || 'zzz'; // Uncategorized goes last
        const catB = b.data.category || 'zzz';
        if (catA !== catB) {
          return catA.localeCompare(catB);
        }
        return b.cachedAt - a.cachedAt;
      }
    });

    setFilteredClaims(filtered);
  }, []);

  /**
   * Refresh cached claims from localStorage and apply current filters/sort
   */
  const refreshCachedClaims = useCallback(() => {
    try {
      const claims = getAllCachedClaims<Claim>();
      setCachedClaims(claims);
      filterAndSortClaims(claims, searchQuery, sortBy);
    } catch (error) {
      console.error('Failed to load cached claims:', error);
      setCachedClaims([]);
      setFilteredClaims([]);
    }
  }, [searchQuery, sortBy, filterAndSortClaims]);

  // ===== Effects =====
  
  /**
   * Load cached claims when sidebar opens.
   * Runs after component mounts to avoid hydration mismatches.
   */
  useEffect(() => {
    if (isOpen) {
      // Refresh immediately - localStorage access is synchronous and instant
      refreshCachedClaims();
    }
  }, [isOpen, refreshCachedClaims]);

  /**
   * Listen for cache updates in real-time.
   * Handles both cross-tab (StorageEvent) and same-tab (CustomEvent) updates.
   */
  useEffect(() => {
    // Handle cross-tab storage changes (when cache is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      // Only react to changes in our cache keys
      if (e.key && e.key.startsWith('fact_checker_')) {
        refreshCachedClaims();
      }
    };

    // Handle same-tab cache updates (via custom event from cache.ts)
    const handleCacheUpdate = () => {
      refreshCachedClaims();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cacheUpdated', handleCacheUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cacheUpdated', handleCacheUpdate as EventListener);
    };
  }, [refreshCachedClaims]);

  /**
   * Re-filter and re-sort claims when search query or sort mode changes
   */
  useEffect(() => {
    filterAndSortClaims(cachedClaims, searchQuery, sortBy);
  }, [searchQuery, sortBy, cachedClaims, filterAndSortClaims]);

  /**
   * Handle Escape key to close sidebar and prevent body scroll when open
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // ===== Event Handlers =====
  
  /**
   * Clear all cached claims after confirmation
   */
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all cached claims? This cannot be undone.')) {
      clearCache();
      setCachedClaims([]);
    }
  };

  /**
   * Remove a single claim from cache
   */
  const handleRemoveClaim = (claim: string) => {
    removeCachedClaim(claim);
    refreshCachedClaims();
  };

  // ===== Helper Functions =====
  
  // Using shared date utilities for consistent formatting
  const formatDate = formatHistoryDate;

  // ===== Computed Values =====
  
  /**
   * Dynamic class names for backdrop and sidebar based on open state
   */
  const backdropClassName = `fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300 ${
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`;

  const sidebarClassName = `fixed top-0 left-0 h-full w-full max-w-md sm:max-w-lg bg-white dark:bg-black border-r-2 border-gray-200 dark:border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  // ===== Render =====
  
  return (
    <>
      <div
        className={backdropClassName}
        onClick={onClose}
      />
      <div className={sidebarClassName}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              History
            </h2>
            <div className="flex items-center gap-2">
              {cachedClaims.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  title="Clear all"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {cachedClaims.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search claims..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  autoFocus
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Sort by:</span>
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    sortBy === 'date'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Date
                </button>
                <button
                  onClick={() => setSortBy('category')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    sortBy === 'category'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Category
                </button>
              </div>

              {searchQuery && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredClaims.length} of {cachedClaims.length} result{filteredClaims.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 history-sidebar-scroll">
            {cachedClaims.length === 0 ? (
              <div className="text-center py-12 px-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No cached claims
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Your previously checked claims will appear here.
                </p>
                <Link
                  href="/"
                  onClick={onClose}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-black text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px] touch-manipulation"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back to Home</span>
                </Link>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-12 px-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No results found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Try adjusting your search query.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {!searchQuery && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {cachedClaims.length} cached claim{cachedClaims.length !== 1 ? 's' : ''}
                  </p>
                )}
                
                {filteredClaims.map((entry, index) => {
                  const claimText = entry.data.content || entry.claim;
                  const originalIndex = cachedClaims.findIndex(c => c.claim === entry.claim);
                  const displayIndex = originalIndex >= 0 ? originalIndex : index;
                  
                  return (
                    <div
                      key={displayIndex}
                      className="bg-gray-100 dark:bg-[#181a1c] rounded-lg border border-gray-300 dark:border-gray-700 p-4 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        {entry.data.id ? (
                          <Link
                            href={`/results/${entry.data.id}`}
                            onClick={onClose}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {entry.data.category && (
                                <span className="px-2 py-0.5 text-xs font-semibold uppercase rounded bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {entry.data.category}
                                </span>
                              )}
                              {entry.data.processingStatus === 'completed' && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                  ✓
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {claimText}
                            </p>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                              <span>{formatDate(entry.cachedAt)}</span>
                              <span>•</span>
                              <span>{getTimeUntilExpiry(entry.expiresAt)}</span>
                              {entry.data.steelmanArguments && (
                                <>
                                  <span>•</span>
                                  <span>{entry.data.steelmanArguments.length} counter-argument{entry.data.steelmanArguments.length !== 1 ? 's' : ''}</span>
                                </>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {entry.data.category && (
                                <span className="px-2 py-0.5 text-xs font-semibold uppercase rounded bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {entry.data.category}
                                </span>
                              )}
                              {entry.data.processingStatus === 'completed' && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                  ✓
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-2 line-clamp-2">
                              {claimText}
                            </p>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                              <span>{formatDate(entry.cachedAt)}</span>
                              <span>•</span>
                              <span>{getTimeUntilExpiry(entry.expiresAt)}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-end gap-2">
                          {entry.data.id ? (
                            <Link
                              href={`/results/${entry.data.id}`}
                              onClick={onClose}
                              className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-gray-100 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                            >
                              View
                            </Link>
                          ) : (
                            <button
                              onClick={() => setExpandedClaim(expandedClaim === displayIndex ? null : displayIndex)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-gray-100 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                            >
                              {expandedClaim === displayIndex ? 'Hide' : 'View'}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveClaim(entry.claim);
                            }}
                            className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {expandedClaim === displayIndex && !entry.data.id && (
                        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700 animate-[slideDown_0.2s_ease-out]">
                          {entry.data.steelmanArguments && entry.data.steelmanArguments.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Counter-Arguments ({entry.data.steelmanArguments.length})
                              </h4>
                              {entry.data.steelmanArguments.map((arg, argIndex) => (
                                <div
                                  key={argIndex}
                                  className="bg-gray-200 dark:bg-gray-800 rounded p-3 border border-gray-300 dark:border-gray-700"
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium flex-1">
                                      {arg.argument}
                                    </p>
                                    <CopyButton 
                                      text={arg.argument} 
                                      size="sm"
                                      className="flex-shrink-0"
                                    />
                                  </div>
                                  {arg.reasoning && (
                                    <p className="text-xs text-gray-700 dark:text-gray-400 mb-2">
                                      {arg.reasoning}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-500">
                                    <span>Strength: {arg.strength}/10</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              No counter-arguments available.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
