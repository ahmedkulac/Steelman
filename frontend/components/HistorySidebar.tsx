'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllCachedClaims, clearCache, removeCachedClaim } from '@/lib/cache';
import { Claim } from '@/lib/api/claims';

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
  const [cachedClaims, setCachedClaims] = useState<CachedClaimEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCachedClaims();
    }
  }, [isOpen]);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadCachedClaims = () => {
    try {
      const claims = getAllCachedClaims<Claim>();
      setCachedClaims(claims);
    } catch (error) {
      console.error('Failed to load cached claims:', error);
      setCachedClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all cached claims? This cannot be undone.'
      )
    ) {
      clearCache();
      setCachedClaims([]);
    }
  };

  const handleRemoveClaim = (claim: string) => {
    removeCachedClaim(claim);
    loadCachedClaims();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilExpiry = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days}d left`;
    } else {
      return 'Expiring soon';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-md sm:max-w-lg bg-white dark:bg-black border-r-2 border-gray-200 dark:border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 history-sidebar-scroll">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : cachedClaims.length === 0 ? (
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
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {cachedClaims.length} cached claim{cachedClaims.length !== 1 ? 's' : ''}
                </p>
                
                {cachedClaims.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-[#181a1c] rounded-lg border border-gray-300 dark:border-gray-700 p-4 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
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
                          {entry.data.content || entry.claim}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span>{formatDate(entry.cachedAt)}</span>
                          <span>•</span>
                          <span>{getTimeUntilExpiry(entry.expiresAt)}</span>
                        </div>
                      </div>
                      
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
                            onClick={() => setExpandedClaim(expandedClaim === index ? null : index)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-gray-100 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                          >
                            {expandedClaim === index ? 'Hide' : 'View'}
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveClaim(entry.claim)}
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
                    
                    {/* Expanded view for cached claims without IDs */}
                    {expandedClaim === index && !entry.data.id && (
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
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">
                                  {arg.argument}
                                </p>
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
