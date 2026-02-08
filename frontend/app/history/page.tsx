'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllCachedClaims, clearCache, removeCachedClaim } from '@/lib/cache';
import { Claim } from '@/lib/api/claims';

interface CachedClaimEntry {
  claim: string;
  data: Claim;
  cachedAt: number;
  expiresAt: number;
}

export default function HistoryPage() {
  const [cachedClaims, setCachedClaims] = useState<CachedClaimEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);

  useEffect(() => {
    loadCachedClaims();
  }, []);

  const loadCachedClaims = () => {
    const claims = getAllCachedClaims<Claim>();
    setCachedClaims(claims);
    setLoading(false);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all cached claims? This cannot be undone.')) {
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
      year: 'numeric',
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
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    } else {
      return 'Expiring soon';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation"
            aria-label="Back to home"
          >
            <svg
              className="w-6 h-6 transition-transform duration-200 group-hover:-translate-x-0.5"
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
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Claim History
          </h1>
        </div>
        {cachedClaims.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {cachedClaims.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No cached claims
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your previously checked claims will appear here.
          </p>
          <Link
            href="/"
            className="group mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px] touch-manipulation"
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
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {cachedClaims.length} cached claim{cachedClaims.length !== 1 ? 's' : ''}
          </p>
          
          {cachedClaims.map((entry, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {entry.data.category && (
                      <span className="px-2 py-1 text-xs font-semibold uppercase rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {entry.data.category}
                      </span>
                    )}
                    {entry.data.processingStatus === 'completed' && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        Completed
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-2 line-clamp-2">
                    {entry.data.content || entry.claim}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Cached: {formatDate(entry.cachedAt)}</span>
                    <span>•</span>
                    <span>{getTimeUntilExpiry(entry.expiresAt)}</span>
                    {entry.data.steelmanArguments && (
                      <>
                        <span>•</span>
                        <span>
                          {entry.data.steelmanArguments.length} counter-argument
                          {entry.data.steelmanArguments.length !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex items-center gap-2">
                    {entry.data.id ? (
                      <Link
                        href={`/results/${entry.data.id}`}
                        className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        View
                      </Link>
                    ) : (
                      <button
                        onClick={() => setExpandedClaim(expandedClaim === index ? null : index)}
                        className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {expandedClaim === index ? 'Hide' : 'View'}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveClaim(entry.claim)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remove from history"
                  >
                    <svg
                      className="w-5 h-5"
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
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {entry.data.steelmanArguments && entry.data.steelmanArguments.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Counter-Arguments ({entry.data.steelmanArguments.length})
                      </h4>
                      {entry.data.steelmanArguments.map((arg, argIndex) => (
                        <div
                          key={argIndex}
                          className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                        >
                          <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                            {arg.argument}
                          </p>
                          {arg.reasoning && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {arg.reasoning}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              Strength: {arg.strength}/10
                            </span>
                            {entry.data.confidenceScore && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                Confidence: {Math.round(entry.data.confidenceScore * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No counter-arguments available for this cached claim.
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
  );
}
