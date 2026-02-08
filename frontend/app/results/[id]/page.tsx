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

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClaim, Claim } from '@/lib/api/claims';
import SteelmanResult from '@/components/SteelmanResult';

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

  const claimId = params.id as string;

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
  }, [claimId, polling]);

  /**
   * Fetch claim data from API
   * 
   * @param showLoading - Whether to show loading spinner (default: true)
   */
  const fetchClaim = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getClaim(claimId);
      setClaim(data);
      setError(null);

      // Stop polling if claim processing is complete
      if (data.processingStatus === 'completed' || data.processingStatus === 'failed') {
        setPolling(false);
      } else {
        // Continue polling if still processing
        setPolling(true);
      }
    } catch (err: unknown) {
      // Type-safe error handling
      const error =
        err && typeof err === 'object' && 'message' in err
          ? (err as {
              message?: string;
              response?: { data?: { message?: string } };
            })
          : null;
      
      setError(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load claim results'
      );
      setPolling(false); // Stop polling on error
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Go Back Home
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>

        {/* Results Component */}
        <SteelmanResult claim={claim} />
      </div>
    </main>
  );
}
