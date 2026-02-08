/**
 * ClaimInput Component
 * 
 * Main form component for submitting claims to be fact-checked.
 * Features:
 * - Form validation using React Hook Form + Zod
 * - Character counter (max 1000 chars)
 * - Category selection
 * - Optional context field
 * - Error handling and loading states
 * - Mobile-responsive design
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
    .min(10, 'Claim must be at least 10 characters')
    .max(1000, 'Claim must be less than 1000 characters'),
  category: z
    .enum(['politics', 'science', 'health', 'technology', 'economics', 'other'])
    .optional(),
  context: z.string().max(500).optional(),
});

type ClaimFormData = z.infer<typeof claimSchema>;

/**
 * Available claim categories
 */
const categories = [
  { value: 'politics', label: 'Politics' },
  { value: 'science', label: 'Science' },
  { value: 'health', label: 'Health' },
  { value: 'technology', label: 'Technology' },
  { value: 'economics', label: 'Economics' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * ClaimInput Component
 * 
 * Renders a form for submitting claims with:
 * - Text area for claim input
 * - Category dropdown
 * - Optional context field
 * - Real-time character counting
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
    watch,
    formState: { errors },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
  });

  // Watch claim text for character counter
  const claimText = watch('claim', '');
  const characterCount = claimText.length;
  const maxLength = 1000;

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
    } catch (err: any) {
      // Enhanced error handling with detailed messages
      let errorMessage = 'Failed to submit claim. ';
      
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error') || !err.response) {
        // Network/connection error
        errorMessage += 'Cannot connect to backend server. ';
        errorMessage += 'Please make sure the backend is running on http://localhost:5000';
      } else if (err.response?.status === 429) {
        // Rate limit error
        errorMessage = err.response?.data?.message || 'Rate limit exceeded. Please try again later.';
      } else if (err.response?.status === 400) {
        // Validation error
        errorMessage = err.response?.data?.message || 'Invalid input. Please check your claim.';
      } else if (err.response?.data?.message) {
        // Backend error message
        errorMessage = err.response.data.message;
      } else if (err.message) {
        // Generic error
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {/* Claim Input Field */}
      <div>
        <label
          htmlFor="claim"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Enter a claim to fact-check
        </label>
        <textarea
          id="claim"
          {...register('claim')}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          placeholder="e.g., Climate change is not caused by human activity..."
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          {/* Validation Error */}
          {errors.claim && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.claim.message}
            </p>
          )}
          {/* Character Counter */}
          <p
            className={`text-sm ml-auto ${
              characterCount > maxLength * 0.9
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {characterCount}/{maxLength}
          </p>
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Category (optional)
        </label>
        <select
          id="category"
          {...register('category')}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          disabled={isSubmitting}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Additional Context Field */}
      <div>
        <label
          htmlFor="context"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Additional Context (optional)
        </label>
        <textarea
          id="context"
          {...register('context')}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          placeholder="Provide any additional context that might help..."
          disabled={isSubmitting}
        />
        {errors.context && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.context.message}
          </p>
        )}
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
      >
        {isSubmitting ? 'Submitting...' : 'Fact-Check Claim'}
      </button>
    </form>
  );
}
