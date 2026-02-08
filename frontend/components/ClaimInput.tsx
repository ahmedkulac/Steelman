/**
 * ClaimInput Component
 * 
 * Main form component for submitting claims to be fact-checked.
 * Features:
 * - Form validation using React Hook Form + Zod
 * - URL input for steelmanning
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
import { useRouter } from 'next/navigation';

/**
 * Validation schema for claim submission
 * Matches backend validation for consistency
 */
const claimSchema = z.object({
  claim: z
    .string()
    .url('Please enter a valid URL'),
  category: z.string().default('other'),
  context: z.string().default(''),
});

type ClaimFormData = z.infer<typeof claimSchema>;

/**
 * ClaimInput Component
 * 
 * Renders a form for submitting claims with:
 * - URL input
 * - Form validation
 * - Submit button with loading state
 */
export default function ClaimInput() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      category: 'other' as const,
      context: '',
    },
  });

  /**
   * Handle form submission
   * 
   * 1. Submit claim to backend API
   * 2. Redirect to results page
   * 3. Handle errors gracefully with detailed messages
   */
  const onSubmit = async (data: ClaimFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createClaim(data);
      // Redirect to results page with claim ID
      router.push(`/results/${response.id}`);
    } catch (err: unknown) {
      // Enhanced error handling with detailed messages
      let errorMessage = 'Failed to submit claim. ';

      const error =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message?: string; code?: string; response?: { status?: number; data?: { message?: string } } })
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
          'Invalid input. Please check your URL.';
      } else if (error?.response?.data?.message) {
        // Backend error message
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // Generic error
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }

      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      {/* URL Input Field */}
      <div>
        <label
          htmlFor="claim"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider"
        >
          Enter Article URL
        </label>
        <input
          type="url"
          id="claim"
          {...register('claim')}
          className="w-full px-4 py-3 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-gray-900 dark:focus:border-gray-100 focus:outline-none transition-colors duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="https://example.com/article"
          disabled={isSubmitting}
        />
        <div className="mt-1">
          {/* Validation Error */}
          {errors.claim && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {errors.claim.message}
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
        className="w-full bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white disabled:bg-gray-400 disabled:cursor-not-allowed text-white dark:text-black font-semibold py-4 px-6 uppercase tracking-widest transition-colors duration-200 border border-transparent"
      >
        {isSubmitting ? 'PROCESSING...' : 'STEELMAN THIS'}
      </button>
    </form>
  );
}
