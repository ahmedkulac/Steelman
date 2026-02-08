/**
 * ClaimInput Component
 * 
 * Main form component for submitting claims to be fact-checked.
 * Features:
 * - Mode selector: Claim (text) or URL (article/social media)
 * - Form validation using React Hook Form + Zod
 * - Error handling and loading states
 * - Mobile-responsive design
 * - Minimalist monochromatic design
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClaim } from '@/lib/api/claims';
import { analyzeUrl } from '@/lib/api/analyze';
import { useRouter } from 'next/navigation';

type InputMode = 'claim' | 'url';

/**
 * Validation schema for claim submission (text mode)
 */
const claimTextSchema = z.object({
  input: z
    .string()
    .min(10, 'Claim must be at least 10 characters')
    .max(1000, 'Claim must be less than 1000 characters'),
  category: z.enum(['other', 'politics', 'science', 'health', 'technology', 'economics']).default('other'),
  context: z.string().max(500).optional().default(''),
});

/**
 * Validation schema for URL submission
 */
const urlSchema = z.object({
  input: z
    .string()
    .url('Please enter a valid URL'),
});

type ClaimTextFormData = z.infer<typeof claimTextSchema>;
type UrlFormData = z.infer<typeof urlSchema>;

/**
 * ClaimInput Component
 * 
 * Renders a form for submitting claims with:
 * - Mode selector (Claim vs URL)
 * - Dynamic form validation based on mode
 * - Submit button with loading state
 */
export default function ClaimInput() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>('claim');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Hook Form setup for claim text mode
  const claimForm = useForm<ClaimTextFormData>({
    resolver: zodResolver(claimTextSchema),
    defaultValues: {
      category: 'other' as const,
      context: '',
    },
  });

  // React Hook Form setup for URL mode
  const urlForm = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
  });

  /**
   * Handle claim text submission
   */
  const onSubmitClaim = async (data: ClaimTextFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createClaim({
        claim: data.input,
        category: data.category,
        context: data.context,
      });
      // Redirect to results page with claim ID
      router.push(`/results/${response.id}`);
    } catch (err: unknown) {
      handleError(err, 'Failed to submit claim');
    }
  };

  /**
   * Handle URL submission
   */
  const onSubmitUrl = async (data: UrlFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Analyze the URL and redirect to analyze page with results
      const result = await analyzeUrl(data.input);
      // Store result in sessionStorage and redirect to analyze page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('analyzeResult', JSON.stringify(result));
        router.push('/analyze');
      }
    } catch (err: unknown) {
      handleError(err, 'Failed to analyze URL');
    }
  };

  /**
   * Handle errors with detailed messages
   */
  const handleError = (err: unknown, defaultMessage: string) => {
    let errorMessage = `${defaultMessage}. `;

    const error =
      err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string; code?: string; response?: { status?: number; data?: { message?: string; error?: string } } })
        : null;

    if (
      error?.code === 'ECONNREFUSED' ||
      error?.message?.includes('Network Error') ||
      !error?.response
    ) {
      // Network/connection error
      errorMessage += 'Cannot connect to backend server. ';
      errorMessage += 'Please make sure the backend is running on http://localhost:5000';
    } else if (error?.response?.status === 429) {
      // Rate limit error
      errorMessage =
        error.response?.data?.message ||
        'Rate limit exceeded. Please try again later.';
    } else if (error?.response?.status === 400) {
      // Validation error
      errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid input. Please check your entry.';
    } else if (error?.response?.data?.message) {
      // Backend error message
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      // Backend error
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      // Generic error
      errorMessage += error.message;
    } else {
      errorMessage += 'Please try again.';
    }

    setError(errorMessage);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2 border-b-2 border-gray-300 dark:border-gray-600">
        <button
          type="button"
          onClick={() => {
            setMode('claim');
            setError(null);
            claimForm.reset();
            urlForm.reset();
          }}
          className={`flex-1 py-3 px-4 text-sm font-semibold uppercase tracking-wider transition-colors duration-200 ${
            mode === 'claim'
              ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Claim
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('url');
            setError(null);
            claimForm.reset();
            urlForm.reset();
          }}
          className={`flex-1 py-3 px-4 text-sm font-semibold uppercase tracking-wider transition-colors duration-200 ${
            mode === 'url'
              ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          URL
        </button>
      </div>

      {/* Claim Text Form */}
      {mode === 'claim' && (
        <form onSubmit={claimForm.handleSubmit(onSubmitClaim)} className="space-y-6">
          <div>
            <textarea
              id="claim-input"
              aria-label="Enter your claim"
              {...claimForm.register('input')}
              rows={4}
              className="w-full px-4 py-3 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-gray-900 dark:focus:border-gray-100 focus:outline-none transition-colors duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              placeholder="Enter your claim or statement to fact-check..."
              disabled={isSubmitting}
            />
            <div className="mt-1">
              {claimForm.formState.errors.input && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {claimForm.formState.errors.input.message}
                </p>
              )}
            </div>
          </div>

          {/* Optional Context Field */}
          <div>
            <textarea
              id="context-input"
              aria-label="Additional context (optional)"
              {...claimForm.register('context')}
              rows={2}
              className="w-full px-4 py-3 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-gray-900 dark:focus:border-gray-100 focus:outline-none transition-colors duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              placeholder="Additional context (optional)"
              disabled={isSubmitting}
            />
            <div className="mt-1">
              {claimForm.formState.errors.context && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {claimForm.formState.errors.context.message}
                </p>
              )}
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-none bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-800 dark:text-gray-200">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-yellow-300 dark:bg-gray-100 dark:hover:bg-yellow-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-white hover:text-black dark:text-black dark:hover:text-black font-semibold py-4 px-6 uppercase tracking-widest transition-all duration-300 border border-transparent hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'PROCESSING...' : 'STEELMAN THIS'}
          </button>
        </form>
      )}

      {/* URL Form */}
      {mode === 'url' && (
        <form onSubmit={urlForm.handleSubmit(onSubmitUrl)} className="space-y-6">
          <div>
            <input
              type="url"
              id="url-input"
              aria-label="Enter article or social media post URL"
              {...urlForm.register('input')}
              className="w-full px-4 py-3 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-gray-900 dark:focus:border-gray-100 focus:outline-none transition-colors duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="https://example.com/article or https://twitter.com/user/status/123"
              disabled={isSubmitting}
            />
            <div className="mt-1">
              {urlForm.formState.errors.input && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {urlForm.formState.errors.input.message}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Supports articles, blog posts, and social media posts
              </p>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-none bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-800 dark:text-gray-200">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-yellow-300 dark:bg-gray-100 dark:hover:bg-yellow-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-white hover:text-black dark:text-black dark:hover:text-black font-semibold py-4 px-6 uppercase tracking-widest transition-all duration-300 border border-transparent hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'ANALYZING...' : 'ANALYZE ARTICLE'}
          </button>
        </form>
      )}
    </div>
  );
}
