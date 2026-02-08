/**
 * Results Page
 * 
 * Dynamic route page that displays the fact-checking results for a specific claim.
 * Features:
 * - Auto-polling while claim is processing
 * - Loading states
 * - Error handling
 * - Results display with steelman counter-arguments
 */

'use client';

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClaim, Claim } from '@/lib/api/claims';
import SteelmanResult from '@/components/SteelmanResult';
import { extractErrorMessage } from '@/lib/errorUtils';

/**
 * ResultsPage Component
 * 
 * Fetches and displays claim results with automatic polling
 * while the claim is being processed by the AI.
 */
export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const claimId = params.id as string;

  /**
   * Fetch claim data from API
   * 
   * @param showLoading - Whether to show loading spinner (default: true)
   */
  const fetchClaim = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const data = await getClaim(claimId);
        setClaim(data);
        setError(null);

        // Stop polling if claim processing is complete or failed
        setPolling(
          data.processingStatus !== 'completed' &&
            data.processingStatus !== 'failed'
        );
      } catch (err: unknown) {
        setError(
          extractErrorMessage(err, 'Failed to load claim results')
        );
        setPolling(false);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [claimId]
  );

  /**
   * Effect hook for fetching claim and setting up polling
   * 
   * Polls every 3 seconds while claim is processing,
   * stops when claim is completed or failed.
   */
  useEffect(() => {
    // Initial fetch
    fetchClaim();

    // Set up polling interval if claim is still processing
    let pollInterval: NodeJS.Timeout | null = null;
    if (polling) {
      pollInterval = setInterval(() => {
        fetchClaim(false); // Don't show loading spinner on poll updates
      }, 3000); // Poll every 3 seconds
    }

    // Cleanup interval on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [claimId, polling, fetchClaim]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <button
              onClick={(e) => {
                e.preventDefault();
                router.push('/');
              }}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg min-h-[44px] touch-manipulation"
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
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check
  if (!claim) {
    return null;
  }

  // Success state - render results
  return (
    <main className="min-h-screen bg-white dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (isNavigating) return;
            setIsNavigating(true);
            router.push('/');
          }}
          disabled={isNavigating}
          className="group mb-6 inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation font-medium min-h-[44px] relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Back to home"
          type="button"
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
          <span>{isNavigating ? 'Loading...' : 'Back to Home'}</span>
        </button>

        {/* Results Component */}
        <SteelmanResult claim={claim} />
      </div>
    </main>
  );
}
