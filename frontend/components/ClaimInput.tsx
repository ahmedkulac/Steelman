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

export type InputMode = 'claim' | 'url';

interface ClaimInputProps {
  onModeChange?: (mode: InputMode) => void;
}

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
export default function ClaimInput({ onModeChange }: ClaimInputProps) {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>('url');
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
        ? (err as { message?: string; code?: string; response?: { status?: number; data?: { message?: string; error?: string; suggestion?: string; details?: string } } })
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
      const errorData = error.response?.data;
      errorMessage = errorData?.message ||
        errorData?.error ||
        'Invalid input. Please check your entry.';
      if (errorData?.suggestion) {
        errorMessage += ` ${errorData.suggestion}`;
      }
    } else if (error?.response?.status === 422) {
      // Unprocessable entity (e.g., no text content)
      const errorData = error.response?.data;
      errorMessage = errorData?.error || errorData?.details || 'Cannot process this content.';
      if (errorData?.suggestion) {
        errorMessage += ` ${errorData.suggestion}`;
      }
    } else if (error?.response?.data?.message) {
      // Backend error message
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      // Backend error
      const errorData = error.response.data;
      errorMessage = errorData.error;
      if (errorData.suggestion) {
        errorMessage += ` ${errorData.suggestion}`;
      }
    } else if (error?.message) {
      // Generic error
      errorMessage += error.message || 'Unknown error';
    } else {
      errorMessage += 'Please try again.';
    }

    setError(errorMessage);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Mode Selector */}
      <div className="relative flex gap-2 border-b-2 border-gray-300 dark:border-gray-600">
        <button
          type="button"
          onClick={() => {
            setMode('url');
            onModeChange?.('url');
            setError(null);
            claimForm.reset();
            urlForm.reset();
          }}
          className={`relative flex-1 py-3 px-4 text-sm font-semibold uppercase tracking-wider transition-all duration-300 ease-out ${mode === 'url'
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <span className="relative z-10">URL</span>
          {mode === 'url' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-gray-100 animate-slide-in" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('claim');
            onModeChange?.('claim');
            setError(null);
            claimForm.reset();
            urlForm.reset();
          }}
          className={`relative flex-1 py-3 px-4 text-sm font-semibold uppercase tracking-wider transition-all duration-300 ease-out ${mode === 'claim'
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <span className="relative z-10">Claim</span>
          {mode === 'claim' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-gray-100 animate-slide-in" />
          )}
        </button>
      </div >

      {/* Claim Text Form */}
      {
        mode === 'claim' && (
          <form onSubmit={claimForm.handleSubmit(onSubmitClaim)} className="space-y-6">
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  id="claim-input"
                  aria-label="Enter your claim"
                  {...claimForm.register('input')}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none transition-all duration-300 ease-out text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:scale-[1.01] focus:shadow-sm peer"
                  placeholder="Enter your claim or statement to fact-check..."
                  disabled={isSubmitting}
                />
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-gray-100 transform scale-x-0 transition-transform duration-300 origin-left peer-focus:scale-x-100" />
              </div>
              <div className="mt-1">
                {claimForm.formState.errors.input && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {claimForm.formState.errors.input.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Supports simple statements, complex arguments, and quotes.
                </p>
              </div>
            </div>



            {/* Error Message Display */}
            {error && (
              <div className={`p-4 border rounded-none ${error.toLowerCase().includes('paywall')
                ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}>
                <p className={`text-sm font-medium ${error.toLowerCase().includes('paywall')
                  ? 'text-orange-800 dark:text-orange-200'
                  : 'text-gray-800 dark:text-gray-200'
                  }`}>
                  {error.toLowerCase().includes('paywall') && '⚠️ '}
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full bg-gray-900 hover:bg-yellow-300 dark:bg-gray-100 dark:hover:bg-yellow-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-white hover:text-black dark:text-black dark:hover:text-black font-semibold py-4 px-6 uppercase tracking-widest transition-all duration-300 ease-out border border-transparent hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-md overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {isSubmitting ? 'PROCESSING...' : 'STEELMAN THIS'}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-300/0 via-yellow-300/20 to-yellow-300/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            </button>
          </form>
        )
      }

      {/* URL Form */}
      {
        mode === 'url' && (
          <form onSubmit={urlForm.handleSubmit(onSubmitUrl)} className="space-y-6">
            <div className="relative">
              <div className="relative">
                <input
                  type="url"
                  id="url-input"
                  aria-label="Enter article or social media post URL"
                  {...urlForm.register('input')}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none transition-all duration-300 ease-out text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:scale-[1.01] focus:shadow-sm peer"
                  placeholder="https://example.com/article or https://twitter.com/user/status/123"
                  disabled={isSubmitting}
                />
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-gray-100 transform scale-x-0 transition-transform duration-300 origin-left peer-focus:scale-x-100" />
              </div>
              <div className="mt-1">
                {urlForm.formState.errors.input && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {urlForm.formState.errors.input.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Supports articles, blog posts, and social media posts with text content (Instagram captions, TikTok descriptions, tweets, etc.)
                </p>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className={`p-4 border rounded-none ${error.toLowerCase().includes('paywall')
                ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}>
                <p className={`text-sm font-medium ${error.toLowerCase().includes('paywall')
                  ? 'text-orange-800 dark:text-orange-200'
                  : 'text-gray-800 dark:text-gray-200'
                  }`}>
                  {error.toLowerCase().includes('paywall') && '⚠️ '}
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full bg-gray-900 hover:bg-yellow-300 dark:bg-gray-100 dark:hover:bg-yellow-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-white hover:text-black dark:text-black dark:hover:text-black font-semibold py-4 px-6 uppercase tracking-widest transition-all duration-300 ease-out border border-transparent hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-md overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {isSubmitting ? 'STEELMANING...' : 'STEELMAN THIS'}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-300/0 via-yellow-300/20 to-yellow-300/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            </button>
          </form>
        )
      }
    </div >
  );
}
