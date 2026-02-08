'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClaim, Claim } from '@/lib/api/claims';
import SteelmanResult from '@/components/SteelmanResult';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const claimId = params.id as string;

  useEffect(() => {
    fetchClaim();

    // Poll for updates if claim is still processing
    let pollInterval: NodeJS.Timeout | null = null;
    if (polling) {
      pollInterval = setInterval(() => {
        fetchClaim(false);
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [claimId, polling]);

  const fetchClaim = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getClaim(claimId);
      setClaim(data);
      setError(null);

      // Stop polling if claim is completed or failed
      if (data.processingStatus === 'completed' || data.processingStatus === 'failed') {
        setPolling(false);
      } else {
        setPolling(true);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load claim results'
      );
      setPolling(false);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

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

  if (!claim) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>

        <SteelmanResult claim={claim} />
      </div>
    </main>
  );
}
